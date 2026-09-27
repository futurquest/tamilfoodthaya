# PostgreSQL migrations

The installed TypeORM version is 1.1.1. `src/database/data-source.ts` is the CLI DataSource; versioned migrations live in `src/migrations/`. Build before running migrations so the CLI loads the compiled DataSource and migrations from `dist/src/`.

The initial migration supports two cases: it creates all 14 tables on an empty database, or records a baseline on an existing database **only** when the expected tables are present and TypeORM finds no differences beyond the six known JSONB default expressions. It refuses partial or unexpected schemas. Its `down` method refuses to drop tables. It does not copy data or replace a backup.

Production always runs with `synchronize: false`. Development retains its previous synchronization behavior unless `TYPEORM_SYNCHRONIZE=false` is set. After baselining a development database, set that variable to `false` too. Do not run the migration CLI against an existing database until you have a verified backup and a successful restore test.

From `server/`, check the target database configured by the private `POSTGRES_*` variables:

```powershell
npm run build
npm run db:migrate:check
```

On a **new, isolated test database**, run the compiled migration and check for schema drift:

```powershell
node node_modules/typeorm/cli.js migration:run -d dist/src/database/data-source.js
npm run db:migrate:check
node scripts/migration-smoke.cjs crud
```

`migration-smoke.cjs` refuses any host except loopback and any database name outside `tft_migration_(clean|clone)_YYYYMMDD`. Its `seed` and `verify` modes test that related records survive an existing-schema baseline.

The production command is `npm run db:migrate:prod`. It refuses to run unless `NODE_ENV=production`, `CONFIRM_MIGRATION_DATABASE` exactly matches `POSTGRES_DB`, and `RESTORE_TEST_VERIFIED=true`. Set the final flag **only after** a real backup restore has been verified. This command is for an approved deployment procedure; it has not been run against the existing database.
