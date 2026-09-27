require('dotenv/config');

const { createDecipheriv, randomBytes } = require('node:crypto');
const { createReadStream, createWriteStream, promises: fs } = require('node:fs');
const { resolve, join, basename } = require('node:path');
const { spawn } = require('node:child_process');
const { pipeline } = require('node:stream/promises');
const { Client } = require('pg');

const directory = resolve(process.env.BACKUP_DIR || join(__dirname, '..', 'backups'));
const file = process.argv[2] ? resolve(process.argv[2]) : '';
const target = process.env.RESTORE_TEST_DB;
const tables = [
  'addons', 'categories', 'catering_orders', 'catering_packages', 'catering_quotes',
  'change_requests', 'coupons', 'leads', 'menu_items', 'messages',
  'notification_logs', 'orders', 'settings', 'users',
];

async function run(command, args) {
  await new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, PGPASSWORD: process.env.POSTGRES_PASSWORD },
      stdio: ['ignore', 'ignore', 'ignore'], shell: false,
    });
    child.on('error', () => reject(new Error('pg_restore could not start')));
    child.on('close', (code) => code === 0 ? resolveRun() : reject(new Error(`pg_restore exited with code ${code}`)));
  });
}

async function main() {
  if (!target || !/^tft_restore_test_[a-z0-9_]+$/.test(target)) throw new Error('RESTORE_TEST_DB must be a new tft_restore_test_* database');
  if (!file || resolve(file, '..') !== directory || !/^tft-.*\.tftbak$/.test(basename(file))) throw new Error('Choose a backup file inside BACKUP_DIR');
  const key = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY || '', 'base64');
  if (key.length !== 32) throw new Error('BACKUP_ENCRYPTION_KEY must be a base64-encoded 32-byte key');
  for (const name of ['POSTGRES_HOST', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB']) {
    if (!process.env[name]) throw new Error(`${name} is required`);
  }
  const stat = await fs.stat(file);
  if (stat.size <= 36) throw new Error('Encrypted backup is too small');
  const handle = await fs.open(file, 'r');
  const header = Buffer.alloc(20);
  const tag = Buffer.alloc(16);
  try {
    await handle.read(header, 0, 20, 0);
    await handle.read(tag, 0, 16, stat.size - 16);
  } finally { await handle.close(); }
  if (header.subarray(0, 8).toString() !== 'TFTBACK1') throw new Error('Unrecognized backup format');
  const admin = new Client({ host: process.env.POSTGRES_HOST, port: Number(process.env.POSTGRES_PORT || 5432), user: process.env.POSTGRES_USER, password: process.env.POSTGRES_PASSWORD, database: 'postgres' });
  await admin.connect();
  let temporaryArchive;
  try {
    const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [target]);
    if (exists.rowCount) throw new Error('Restore target already exists; refusing to overwrite it');
    temporaryArchive = join(directory, `.restore-${randomBytes(8).toString('hex')}.dump`);
    const decipher = createDecipheriv('aes-256-gcm', key, header.subarray(8));
    decipher.setAuthTag(tag);
    await pipeline(createReadStream(file, { start: 20, end: stat.size - 17 }), decipher, createWriteStream(temporaryArchive, { flags: 'wx', mode: 0o600 }));
    await admin.query(`CREATE DATABASE "${target}"`);
    const restoreArgs = [
      '-h', process.env.PG_TOOLS_DOCKER_IMAGE ? (process.env.PG_TOOLS_DOCKER_HOST || 'host.docker.internal') : process.env.POSTGRES_HOST,
      '-p', process.env.POSTGRES_PORT || '5432',
      '-U', process.env.POSTGRES_USER, '-d', target,
      '--exit-on-error', '--no-owner', '--no-acl',
      process.env.PG_TOOLS_DOCKER_IMAGE ? `/backup/${basename(temporaryArchive)}` : temporaryArchive,
    ];
    if (process.env.PG_TOOLS_DOCKER_IMAGE) {
      await run('docker', ['run', '--rm', '-e', 'PGPASSWORD', '--mount', `type=bind,source=${directory},target=/backup,readonly`, process.env.PG_TOOLS_DOCKER_IMAGE, 'pg_restore', ...restoreArgs]);
    } else {
      await run(process.env.PG_RESTORE_PATH || 'pg_restore', restoreArgs);
    }
    const restored = new Client({ host: process.env.POSTGRES_HOST, port: Number(process.env.POSTGRES_PORT || 5432), user: process.env.POSTGRES_USER, password: process.env.POSTGRES_PASSWORD, database: target });
    await restored.connect();
    try {
      const counts = {};
      for (const table of tables) counts[table] = Number((await restored.query(`SELECT count(*) AS count FROM "${table}"`)).rows[0].count);
      const source = new Client({ host: process.env.POSTGRES_HOST, port: Number(process.env.POSTGRES_PORT || 5432), user: process.env.POSTGRES_USER, password: process.env.POSTGRES_PASSWORD, database: process.env.POSTGRES_DB });
      await source.connect();
      try {
        for (const table of tables) {
          const originalCount = Number((await source.query(`SELECT count(*) AS count FROM "${table}"`)).rows[0].count);
          if (counts[table] !== originalCount) throw new Error(`Row count mismatch for ${table}`);
        }
      } finally { await source.end(); }
      const orphans = Number((await restored.query('SELECT count(*) AS count FROM menu_items m LEFT JOIN categories c ON c._id = m."categoryId" WHERE c._id IS NULL')).rows[0].count);
      if (orphans !== 0) throw new Error('Restored menu-category relationship is broken');
      if (counts.categories === 0 || counts.menu_items === 0) throw new Error('Representative related records are missing');
      console.log(`RESTORE VERIFIED: ${target}; row counts matched for ${tables.length} tables; categories=${counts.categories}; menu_items=${counts.menu_items}; orphaned menu items=${orphans}.`);
    } finally { await restored.end(); }
  } finally {
    await admin.end();
    if (temporaryArchive) await fs.rm(temporaryArchive, { force: true });
  }
}

main().catch((error) => {
  console.error(`Restore verification failed: ${error.message}`);
  process.exitCode = 1;
});
