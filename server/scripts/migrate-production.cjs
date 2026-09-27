require('dotenv/config');

const { AppDataSource } = require('../dist/src/database/data-source.js');

async function main() {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('Production migration requires NODE_ENV=production.');
  }
  if (!process.env.POSTGRES_DB || process.env.CONFIRM_MIGRATION_DATABASE !== process.env.POSTGRES_DB) {
    throw new Error('Set CONFIRM_MIGRATION_DATABASE to the exact target database name.');
  }
  if (process.env.RESTORE_TEST_VERIFIED !== 'true') {
    throw new Error('A verified backup restore is required before production migration.');
  }

  await AppDataSource.initialize();
  try {
    const applied = await AppDataSource.runMigrations({ transaction: 'all' });
    console.log(`Applied ${applied.length} migration(s).`);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
});
