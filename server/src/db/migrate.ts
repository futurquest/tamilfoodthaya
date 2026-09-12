import { connect, disconnect, parseArgs } from './connection';
import type { Db } from './connection';

/**
 * Database migration runner.
 *
 * Migrations live in ./migrations and export `{ name, up, down }`. The runner
 * tracks applied migrations in a special `_migrations` collection so each
 * migration runs exactly once, in order.
 *
 * Usage:
 *   ts-node src/db/migrate.ts status      # show applied / pending
 *   ts-node src/db/migrate.ts             # apply all pending (up)
 *   ts-node src/db/migrate.ts up          # apply all pending
 *   ts-node src/db/migrate.ts down <name> # roll back a previously applied migration
 *   ts-node src/db/migrate.ts latest      # apply only the last pending migration
 *
 * Migration file shape:
 *   export default {
 *     name: '0001-create-menuitem-indexes',
 *     up: async (db) => { ... },
 *     down: async (db) => { ... },  // optional
 *   };
 */

const LEDGER_COLLECTION = '_migrations';

interface Migration {
    name: string;
    up: (db: Db) => Promise<void>;
    down?: (db: Db) => Promise<void>;
}

function loadMigrations(): Migration[] {
    const module = require('./migrations/index');
    const migrations = (module.default || module.migrations || []) as Migration[];
    if (!Array.isArray(migrations)) return [];
    return migrations
        .filter((m) => m && typeof m.name === 'string')
        .sort((a, b) => a.name.localeCompare(b.name));
}

async function getAppliedNames(db: Db): Promise<string[]> {
    const hasLedger = await db.listCollections({ name: LEDGER_COLLECTION }).hasNext();
    if (!hasLedger) return [];
    const docs = await db.collection(LEDGER_COLLECTION).find({}, { projection: { name: 1 } }).toArray();
    return docs.map((d) => d.name as string);
}

const help = `Database migrations
===================
Usage:
  migrate.ts status       Show applied and pending migrations
  migrate.ts [up]         Apply all pending migrations
  migrate.ts latest       Apply only the newest pending migration
  migrate.ts down <name>  Roll back an applied migration by its exact name
  migrate.ts create <name> Scaffold a new migration file (see migrate-new.ts)
`;

async function main() {
    const argv = process.argv.slice(2);
    const command = argv[0] || 'up';
    const arg = argv[1];

    if (['help', '-h', '--help'].includes(command)) {
        console.log(help);
        return;
    }

    const db = await connect();
    const migrations = loadMigrations();
    const applied = new Set(await getAppliedNames(db));

    if (command === 'status') {
        console.log(`📋 Migration status (${migrations.length} registered):`);
        for (const m of migrations) {
            const done = applied.has(m.name);
            console.log(`   ${done ? '✅' : '⬜️'} ${m.name}${done ? '' : '  (pending)'}`);
        }
        await disconnect();
        return;
    }

    if (command === 'down') {
        if (!arg) {
            console.error('❌ Usage: migrate.ts down <name>');
            await disconnect();
            process.exit(1);
        }
        const target = migrations.find((m) => m.name === arg);
        if (!target) {
            console.error(`❌ Unknown migration: ${arg}`);
            await disconnect();
            process.exit(1);
        }
        if (!applied.has(target.name)) {
            console.error(`❌ Migration was never applied: ${arg}`);
            await disconnect();
            process.exit(1);
        }
        console.log(`↩️   Rolling back ${target.name}...`);
        await target.down?.(db);
        await db.collection(LEDGER_COLLECTION).deleteOne({ name: target.name });
        const remaining = await db.collection(LEDGER_COLLECTION).find({}).toArray();
        console.log(`   ✓ ${target.name} rolled back.`);
        if (remaining.length) console.log(`   Still applied: ${remaining.map((d) => d.name).join(', ')}`);
        else console.log('   No migrations remain applied.');
        await disconnect();
        return;
    }

    if (command === 'create') {
        const name = arg || `migration-${Date.now()}`;
        const { createMigration } = require('./migrate-new') as { createMigration: (n: string) => Promise<string> };
        await createMigration(name);
        await disconnect();
        return;
    }

    const pending = migrations.filter((m) => !applied.has(m.name));
    if (!pending.length) {
        console.log('✅ No pending migrations.');
        await disconnect();
        return;
    }

    const toRun = command === 'latest' ? pending.slice(-1) : pending;
    console.log(`🔁 Applying ${toRun.length}/${pending.length} pending migration(s)...`);

    for (const m of toRun) {
        console.log(`   → ${m.name} ...`);
        try {
            await m.up(db);
            await db.collection(LEDGER_COLLECTION).insertOne({
                name: m.name,
                appliedAt: new Date(),
            });
            console.log(`   ✓ ${m.name} applied.`);
        } catch (err) {
            console.error(`   ✗ ${m.name} FAILED:`, err);
            await disconnect();
            process.exit(1);
        }
    }

    const remaining = await getAppliedNames(db);
    const notYet = migrations.filter((m) => !remaining.includes(m.name));
    console.log(`✅ Done. ${remaining.length} applied, ${notYet.length} pending.`);
    await disconnect();
}

main().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});