require('dotenv/config');

const { createCipheriv, randomBytes } = require('node:crypto');
const { createWriteStream, promises: fs } = require('node:fs');
const { join, resolve, basename } = require('node:path');
const { spawn } = require('node:child_process');
const { pipeline } = require('node:stream/promises');

const magic = Buffer.from('TFTBACK1');
const directory = resolve(process.env.BACKUP_DIR || join(__dirname, '..', 'backups'));
const localOnly = process.argv.includes('--local-only') && process.env.NODE_ENV !== 'production';
let stage = 'configuration';

function run(command, args, env) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { env, stdio: ['ignore', 'ignore', 'ignore'], shell: false });
    child.on('error', () => reject(new Error(`${stage} command could not start`)));
    child.on('close', (code) => code === 0 ? resolveRun() : reject(new Error(`${stage} command exited with code ${code}`)));
  });
}

async function alert() {
  if (!process.env.BACKUP_ALERT_WEBHOOK_URL) return false;
  try {
    const response = await fetch(process.env.BACKUP_ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: `Tamil Food Thaya PostgreSQL backup failed at ${stage}. Check backup-failures.log.` }),
      signal: AbortSignal.timeout(10000),
    });
    return response.ok;
  } catch { return false; }
}

async function main() {
  const key = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY || '', 'base64');
  if (key.length !== 32) throw new Error('BACKUP_ENCRYPTION_KEY must be a base64-encoded 32-byte key');
  for (const name of ['POSTGRES_HOST', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB']) {
    if (!process.env[name]) throw new Error(`${name} is required`);
  }
  if (!localOnly && !/^s3:\/\/[^/]+\/.+/.test(process.env.BACKUP_OFFSITE_URI || '')) {
    throw new Error('BACKUP_OFFSITE_URI must be an S3 prefix, or use --local-only outside production');
  }
  if (!localOnly && !process.env.BACKUP_ALERT_WEBHOOK_URL) {
    throw new Error('BACKUP_ALERT_WEBHOOK_URL is required for scheduled backups');
  }
  const retention = Number(process.env.BACKUP_RETENTION_DAYS || 14);
  if (!Number.isInteger(retention) || retention < 1) throw new Error('BACKUP_RETENTION_DAYS must be a positive integer');
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const name = `tft-${stamp}-${randomBytes(4).toString('hex')}.tftbak`;
  const destination = join(directory, name);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const pgEnv = { ...process.env, PGPASSWORD: process.env.POSTGRES_PASSWORD };
  stage = 'pg_dump';
  const dumpArgs = [
    '-h', process.env.PG_TOOLS_DOCKER_IMAGE ? (process.env.PG_TOOLS_DOCKER_HOST || 'host.docker.internal') : process.env.POSTGRES_HOST,
    '-p', process.env.POSTGRES_PORT || '5432',
    '-U', process.env.POSTGRES_USER, '-d', process.env.POSTGRES_DB,
    '-Fc', '-Z', '9', '--no-owner', '--no-acl',
  ];
  const command = process.env.PG_TOOLS_DOCKER_IMAGE ? 'docker' : (process.env.PG_DUMP_PATH || 'pg_dump');
  const args = process.env.PG_TOOLS_DOCKER_IMAGE
    ? ['run', '--rm', '-e', 'PGPASSWORD', process.env.PG_TOOLS_DOCKER_IMAGE, 'pg_dump', ...dumpArgs]
    : dumpArgs;
  const child = spawn(command, args, { env: pgEnv, stdio: ['ignore', 'pipe', 'ignore'], shell: false });
  const exit = new Promise((resolveExit, reject) => {
    child.on('error', () => reject(new Error('pg_dump could not start')));
    child.on('close', (code) => code === 0 ? resolveExit() : reject(new Error(`pg_dump exited with code ${code}`)));
  });
  void exit.catch(() => {});
  try {
    const output = createWriteStream(destination, { flags: 'wx', mode: 0o600 });
    output.write(Buffer.concat([magic, iv]));
    await pipeline(child.stdout, cipher, output);
    await exit;
    await fs.appendFile(destination, cipher.getAuthTag());
    if (!localOnly) {
      stage = 'offsite upload';
      const uri = `${process.env.BACKUP_OFFSITE_URI.replace(/\/$/, '')}/${name}`;
      await run(process.env.AWS_CLI_PATH || 'aws', ['s3', 'cp', destination, uri, '--only-show-errors'], process.env);
    }
    stage = 'retention';
    const cutoff = Date.now() - retention * 86400000;
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (!entry.isFile() || !/^tft-\d{4}-\d{2}-\d{2}T[\d-]+Z-[0-9a-f]{8}\.tftbak$/.test(entry.name)) continue;
      const file = join(directory, entry.name);
      if ((await fs.stat(file)).mtimeMs < cutoff) await fs.unlink(file);
    }
    console.log(`Backup created: ${basename(destination)} (${localOnly ? 'local restore test only' : 'uploaded off-server'})`);
  } catch (error) {
    child.kill();
    if (stage === 'pg_dump') await fs.rm(destination, { force: true });
    throw error;
  }
}

main().catch(async (error) => {
  await fs.mkdir(directory, { recursive: true, mode: 0o700 }).catch(() => {});
  await fs.appendFile(join(directory, 'backup-failures.log'), `${new Date().toISOString()} ${stage}: ${error.message}\n`).catch(() => {});
  const alerted = await alert();
  console.error(`Backup failed at ${stage}. Alert ${alerted ? 'sent' : 'not sent'}; see backup-failures.log.`);
  process.exitCode = 1;
});
