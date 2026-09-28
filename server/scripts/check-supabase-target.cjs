require('dotenv/config');

const { Client } = require('pg');
const applicationTables = [
  'addons', 'categories', 'catering_orders', 'catering_packages', 'catering_quotes',
  'change_requests', 'coupons', 'leads', 'menu_items', 'messages',
  'notification_logs', 'orders', 'settings', 'users',
];

async function main() {
  const host = process.env.POSTGRES_HOST || '';
  const port = Number(process.env.POSTGRES_PORT);
  const user = process.env.POSTGRES_USER || '';
  const database = process.env.POSTGRES_DB || '';
  const invalid = [
    !/^[a-z0-9.-]+\.pooler\.supabase\.com$/i.test(host) && 'POSTGRES_HOST (use only the Session pooler hostname)',
    port !== 5432 && 'POSTGRES_PORT (must be 5432)',
    !/^postgres\.[a-z0-9]+$/i.test(user) && 'POSTGRES_USER (must be postgres.<project-ref>)',
    database !== 'postgres' && 'POSTGRES_DB (must be postgres)',
  ].filter(Boolean);
  if (invalid.length) throw new Error(`Invalid target setting(s): ${invalid.join(', ')}.`);
  if (!process.env.POSTGRES_PASSWORD) throw new Error('POSTGRES_PASSWORD is required.');

  const ca = process.env.POSTGRES_SSL_CA?.replace(/\\n/g, '\n');
  const client = new Client({
    host, port, user, database, password: process.env.POSTGRES_PASSWORD,
    ssl: ca ? { rejectUnauthorized: true, ca } : { rejectUnauthorized: true },
    connectionTimeoutMillis: 10000,
  });
  await client.connect();
  try {
    const result = await client.query(`
      SELECT current_database() AS database, current_schema() AS schema,
        (SELECT count(*)::integer FROM information_schema.tables
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS public_tables
    `);
    const row = result.rows[0];
    if (row.database !== 'postgres' || row.schema !== 'public') throw new Error('Unexpected database or schema; target check refused.');
    if (process.argv.includes('--after-migration')) {
      const names = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`);
      const expected = [...applicationTables, 'typeorm_migrations'].sort();
      const actual = names.rows.map(item => item.table_name).sort();
      if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Public schema is not the expected 14 application tables plus migration history.');
      const nonempty = [];
      for (const table of applicationTables) {
        const count = await client.query(`SELECT count(*)::integer AS count FROM "${table}"`);
        if (count.rows[0].count) nonempty.push(`${table}=${count.rows[0].count}`);
      }
      console.log(`Supabase schema verified: ${applicationTables.length} application tables; ${nonempty.length ? `existing rows: ${nonempty.join(', ')}` : 'all application tables empty'}.`);
    } else {
      console.log(`Supabase target verified: database=${row.database}, schema=${row.schema}, public_tables=${row.public_tables}.`);
      if (row.public_tables !== 0) throw new Error('Public schema is no longer empty; import must stop.');
    }
  } finally {
    await client.end();
  }
}

main().catch(error => {
  console.error(`Target check failed: ${error.message}`);
  process.exitCode = 1;
});
