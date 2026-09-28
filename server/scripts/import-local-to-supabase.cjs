require('dotenv/config');

const { execFileSync } = require('node:child_process');
const { Client } = require('pg');

const tables = [
  'categories', 'users', 'addons', 'catering_packages', 'catering_quotes',
  'change_requests', 'coupons', 'leads', 'menu_items', 'messages',
  'notification_logs', 'orders', 'catering_orders', 'settings',
];
const migrationName = 'InitialWorkingSchema2026092701000';
const quote = name => `"${name.replace(/"/g, '""')}"`;

async function tableNames(client) {
  const result = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`);
  return result.rows.map(row => row.table_name).sort();
}

async function columns(client, table) {
  const result = await client.query(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position
  `, [table]);
  return result.rows;
}

async function count(client, table) {
  const result = await client.query(`SELECT count(*)::integer AS total FROM ${quote(table)}`);
  return result.rows[0].total;
}

function assertTableNames(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify([...expected].sort())) {
    throw new Error(`${label} does not have the expected tables; transfer refused.`);
  }
}

async function assertEmptyTarget(client) {
  const occupied = [];
  for (const table of tables) {
    const total = await count(client, table);
    if (total) occupied.push(`${table}=${total}`);
  }
  if (occupied.length) throw new Error(`Supabase already has application rows (${occupied.join(', ')}); transfer refused.`);
}

async function main() {
  const execute = process.argv.includes('--execute');
  if (process.argv.some(arg => arg.startsWith('--') && arg !== '--execute')) throw new Error('Only --execute is supported. Without it, this is a read-only dry run.');
  if (!/^[a-z0-9.-]+\.pooler\.supabase\.com$/i.test(process.env.POSTGRES_HOST || '') ||
      Number(process.env.POSTGRES_PORT) !== 5432 ||
      !/^postgres\.[a-z0-9]+$/i.test(process.env.POSTGRES_USER || '') ||
      process.env.POSTGRES_DB !== 'postgres') {
    throw new Error('Supabase target must use the session pooler on port 5432 and database postgres.');
  }
  if (execute && (process.env.NODE_ENV !== 'production' || process.env.CONFIRM_MIGRATION_DATABASE !== 'postgres' || process.env.RESTORE_TEST_VERIFIED !== 'true')) {
    throw new Error('Production confirmation and verified restore flags are required for --execute.');
  }
  if (!process.env.POSTGRES_PASSWORD || !process.env.POSTGRES_SSL_CA) throw new Error('Supabase password and trusted CA are required.');

  const localPassword = execFileSync('docker', ['exec', 'tamilfoodthaya-pg', 'printenv', 'POSTGRES_PASSWORD'], { encoding: 'utf8', timeout: 10000 }).trim();
  if (!localPassword) throw new Error('Local Docker database password is missing.');
  const source = new Client({ host: '127.0.0.1', port: 5433, user: 'tft', password: localPassword, database: 'tftdb', connectionTimeoutMillis: 10000 });
  const target = new Client({
    host: process.env.POSTGRES_HOST, port: 5432, user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: true, ca: process.env.POSTGRES_SSL_CA.replace(/\\n/g, '\n') },
    connectionTimeoutMillis: 10000,
  });
  let sourceConnected = false;
  let targetConnected = false;
  let sourceTransaction = false;
  let targetTransaction = false;
  try {
    await source.connect();
    sourceConnected = true;
    await target.connect();
    targetConnected = true;
    await source.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    sourceTransaction = true;

    assertTableNames(await tableNames(source), tables, 'Local source');
    assertTableNames(await tableNames(target), [...tables, 'typeorm_migrations'], 'Supabase target');
    const migration = await target.query('SELECT 1 FROM typeorm_migrations WHERE name = $1', [migrationName]);
    if (migration.rowCount !== 1) throw new Error('Supabase initial migration record is missing; transfer refused.');
    const exposed = await target.query(`
      SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname = ANY($1)
        AND (has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE')
          OR has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE'))
    `, [tables]);
    if (exposed.rowCount) throw new Error(`Supabase Data API roles can access application tables (${exposed.rows.map(row => row.relname).join(', ')}); revoke those grants before importing private records.`);

    const sourceColumns = new Map();
    const sourceCounts = new Map();
    let totalRows = 0;
    for (const table of tables) {
      const from = await columns(source, table);
      const to = await columns(target, table);
      const normalized = rows => rows.map(row => `${row.column_name}:${row.data_type}`).sort();
      if (JSON.stringify(normalized(from)) !== JSON.stringify(normalized(to))) throw new Error(`Column mismatch in ${table}; transfer refused.`);
      sourceColumns.set(table, from);
      const rows = await count(source, table);
      sourceCounts.set(table, rows);
      totalRows += rows;
    }
    if (totalRows > 10000) throw new Error('More than 10,000 source rows; use a streamed import instead.');
    await assertEmptyTarget(target);
    console.log(`Transfer preflight passed: 14 matching tables, ${totalRows} local rows, Supabase application tables empty.`);
    if (!execute) {
      console.log('DRY RUN ONLY. No data was copied.');
      return;
    }

    await target.query('BEGIN');
    targetTransaction = true;
    await target.query("SET LOCAL lock_timeout = '5s'");
    await target.query(`LOCK TABLE ${tables.map(quote).join(', ')} IN ACCESS EXCLUSIVE MODE`);
    await assertEmptyTarget(target);

    for (const table of tables) {
      const metadata = sourceColumns.get(table);
      const rows = await source.query(`SELECT * FROM ${quote(table)}`);
      if (rows.rowCount !== sourceCounts.get(table)) throw new Error(`Source row count changed for ${table}; transfer refused.`);
      const names = metadata.map(column => column.column_name);
      const placeholders = metadata.map((column, index) => `$${index + 1}${column.data_type === 'jsonb' || column.data_type === 'json' ? '::jsonb' : ''}`);
      const statement = `INSERT INTO ${quote(table)} (${names.map(quote).join(', ')}) VALUES (${placeholders.join(', ')})`;
      for (const row of rows.rows) {
        const values = metadata.map(column => {
          const value = row[column.column_name];
          return value !== null && (column.data_type === 'jsonb' || column.data_type === 'json') ? JSON.stringify(value) : value;
        });
        await target.query(statement, values);
      }
      if (await count(target, table) !== sourceCounts.get(table)) throw new Error(`Post-import row count mismatch for ${table}; rolling back.`);
    }
    const orphaned = await target.query('SELECT count(*)::integer AS total FROM menu_items m LEFT JOIN categories c ON c._id = m."categoryId" WHERE c._id IS NULL');
    if (orphaned.rows[0].total !== 0) throw new Error('Menu/category relationship check failed; rolling back.');
    await target.query('COMMIT');
    targetTransaction = false;
    console.log(`IMPORT VERIFIED: ${totalRows} rows copied across 14 tables; menu/category relationships intact.`);
  } finally {
    if (targetTransaction) await target.query('ROLLBACK').catch(() => {});
    if (sourceTransaction) await source.query('ROLLBACK').catch(() => {});
    if (targetConnected) await target.end().catch(() => {});
    if (sourceConnected) await source.end().catch(() => {});
  }
}

main().catch(error => {
  console.error(`Import stopped: ${error.message}`);
  process.exitCode = 1;
});
