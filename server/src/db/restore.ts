import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { EJSON } from 'bson';
import { connect, disconnect, parseArgs } from './connection';
import type { Db } from './connection';

/**
 * Database restore / import tool.
 *
 * Restores a backup directory produced by `backup.ts`. Two modes:
 *   replace  - drops existing collections and re-inserts from the archive
 *              (a full, faithful restore)
 *   merge    - upserts the archived docs into the existing collections
 *              (no data is lost; existing _ids are overwritten)
 *
 * Usage:
 *   ts-node src/db/restore.ts --dir ./backups/tamilfoodthaya-20260101000000
 *   ts-node src/db/restore.ts --dir ./backups/tamilfoodthaya-20260101000000 --mode merge
 *   ts-node src/db/restore.ts --dir ./backups/tamilfoodthaya-20260101000000 --collections=users,menu
 *   ts-node src/db/restore.ts --dir ./backups/... --dry-run
 */

const DEFAULT_BACKUPS = path.resolve(__dirname, '../../backups');

const help = `Database restore / import
=========================
Restores a backup directory produced by backup.ts.

Options:
  --dir=<path>          Backup directory to restore (required, or under ${DEFAULT_BACKUPS})
  --mode=<replace|merge>  replace drops & re-inserts collections; merge upserts (default: replace)
  --collections=a,b     Restore only the given collections
  --dry-run             Validate and report without writing anything
  --yes                 Skip the confirmation prompt
`;

function readGzip(file: string): string {
    return zlib.gunzipSync(fs.readFileSync(file)).toString('utf8');
}

async function listBackupDirs(dbName: string): Promise<string[]> {
    const dir = DEFAULT_BACKUPS;
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => path.join(dir, e.name))
        .filter((d) => d.includes(dbName) && /-\d{8}T\d{6}$/.test(d))
        .sort()
        .reverse();
}

async function main() {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
        console.log(help);
        return;
    }

    const db = await connect();
    const dbName = db.databaseName;

    const available = await listBackupDirs(dbName);
    let backupDir = typeof args.dir === 'string' ? path.resolve(String(args.dir)) : null;
    if (!backupDir) backupDir = available[0] || null;
    if (!backupDir || !fs.existsSync(backupDir)) {
        console.error(`❌ Backup directory not found. Use --dir or place backups under ${DEFAULT_BACKUPS}`);
        console.error(`   Available: ${available.join(', ') || '(none)'}`);
        await disconnect();
        process.exit(1);
    }

    const manifestPath = path.join(backupDir, 'MANIFEST.json.gz');
    if (!fs.existsSync(manifestPath)) {
        console.error(`❌ ${manifestPath} not found - not a valid backup.`);
        await disconnect();
        process.exit(1);
    }

    const manifest = JSON.parse(readGzip(manifestPath)) as {
        db?: string;
        createdAt?: string;
        collections?: Record<string, number>;
    };

    const collections = Object.keys(manifest.collections || {}).filter(
        (name) => !name.startsWith('system.') && !name.startsWith('admin.'),
    );
    const requested = typeof args.collections === 'string'
        ? String(args.collections).split(',').map((s) => s.trim()).filter(Boolean)
        : null;
    const toRestore = requested ? collections.filter((c) => requested.includes(c)) : collections;

    if (requested && toRestore.length !== requested.length) {
        const missing = requested.filter((c) => !toRestore.includes(c));
        console.error(`❌ Backup does not contain collection(s): ${missing.join(', ')}`);
        await disconnect();
        process.exit(1);
    }

    const mode = args.mode === 'merge' ? 'merge' : 'replace';

    console.log(`🗄️   Backend:  ${manifest.db || '?'} -> ${dbName}`);
    console.log(`📅   Backup:    ${manifest.createdAt || 'unknown'}`);
    console.log(`📦   Mode:      ${mode}`);
    console.log(`   Collections: ${toRestore.length > 0 ? toRestore.join(', ') : '(none)'}`);

    if (!toRestore.length) {
        console.error('❌ Nothing to restore.');
        await disconnect();
        process.exit(1);
    }

    if (args['dry-run']) {
        console.log('\n☁️   DRY RUN - would restore:');
        for (const name of toRestore) {
            const file = path.join(backupDir, `${name}.json.gz`);
            const docs = readGzip(file);
            const count = (JSON.parse(docs) as unknown[]).length;
            console.log(`   ✓ ${name} (${count} docs)`);
        }
        await disconnect();
        return;
    }

    if (mode === 'replace' && !args.yes) {
        console.warn('\n⚠️  replace mode will DROP and re-create these collections, deleting current data.');
        console.warn('   Existing data will be replaced by the backup. Type "yes" to continue:');
        const answer = await ask('> ');
        if (answer.trim().toLowerCase() !== 'yes') {
            console.log('Aborted.');
            await disconnect();
            return;
        }
    }

    for (const name of toRestore) {
        const file = path.join(backupDir, `${name}.json.gz`);
        const docs = EJSON.deserialize(JSON.parse(readGzip(file))) as Document[];

        if (mode === 'replace') {
            await db.collection(name).drop().catch(() => { /* may not exist */ });
            if (docs.length) {
                await db.collection(name).insertMany(docs as never[], { ordered: false });
            }
        } else {
            const ops: { replaceOne: { filter: Record<string, unknown>; replacement: Record<string, unknown>; upsert: true } }[] = docs.map((doc: Document) => ({
                replaceOne: {
                    filter: { _id: (doc as unknown as Record<string, unknown>)._id },
                    replacement: doc as unknown as Record<string, unknown>,
                    upsert: true,
                },
            }));
            if (ops.length) {
                await db.collection(name).bulkWrite(ops as never[], { ordered: false });
            }
        }
        console.log(`   ✓ ${name} (${docs.length} docs) restored`);
    }

    console.log('✅ Restore completed.');
    await disconnect();
}

function ask(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        const readline = require('readline');
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(prompt, (answer: string) => {
            rl.close();
            resolve(answer);
        });
    });
}

main().catch((err) => {
    console.error('❌ Restore failed:', err);
    process.exit(1);
});