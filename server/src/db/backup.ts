import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import * as os from 'os';
import { EJSON } from 'bson';
import { connect, disconnect, parseArgs } from './connection';
import type { Db } from './connection';

/**
 * Database backup tool.
 *
 * Dumps every collection to Extended JSON (everything survives round-trip:
 * ObjectId, Date, Decimal128, binary, ...) gzipped per collection, plus a
 * manifest. Old backups can be pruned by retention count.
 *
 * Usage:
 *   ts-node src/db/backup.ts                     # full backup
 *   ts-node src/db/backup.ts --out ./backups     # custom output dir
 *   ts-node src/db/backup.ts --keep 10           # prune to last 10 backups
 *   ts-node src/db/backup.ts --collections=a,b   # backup only these
 */

const DEFAULT_OUT = path.resolve(__dirname, '../../backups');

function timestamp(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return [
        d.getFullYear(),
        pad(d.getMonth() + 1),
        pad(d.getDate()),
        'T',
        pad(d.getHours()),
        pad(d.getMinutes()),
        pad(d.getSeconds()),
    ].join('');
}

async function listCollections(db: Db): Promise<string[]> {
    const items = await db.listCollections().toArray();
    return items
        .map((c) => c.name)
        .filter((name) => !name.startsWith('system.') && !name.startsWith('admin.'));
}

async function backupCollection(db: Db, name: string, outFile: string): Promise<number> {
    const cursor = db.collection(name).find({});
    const docs: unknown[] = [];
    for await (const doc of cursor) {
        docs.push(doc);
    }
    const serialized = JSON.stringify(EJSON.serialize(docs, { relaxed: false }));
    writeGzip(outFile, serialized);
    return docs.length;
}

function writeGzip(file: string, content: string): void {
    const gzip = zlib.gzipSync(content);
    fs.writeFileSync(file, gzip);
}

const help = `Database backup
=================
Dumps all (or selected) collections to gzipped Extended JSON files under
${DEFAULT_OUT}.

Options:
  --out=<dir>         Output directory (default: ${DEFAULT_OUT})
  --keep=<n>           Retain only the n most recent backups (default: infinite)
  --collections=a,b    Backup only the given collections
  --dry-run            Show what would be backed up without writing
`;

async function main() {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
        console.log(help);
        return;
    }

    const db = await connect();
    const dbName = db.databaseName;

    const allCollections = await listCollections(db);
    const requested = typeof args.collections === 'string'
        ? String(args.collections).split(',').map((s) => s.trim()).filter(Boolean)
        : null;
    const collections = requested ? allCollections.filter((c) => requested.includes(c)) : allCollections;

    if (requested && collections.length !== requested.length) {
        const missing = requested.filter((c) => !collections.includes(c));
        console.error(`❌ Unknown collection(s): ${missing.join(', ')}`);
        await disconnect();
        process.exit(1);
    }

    const outDir = typeof args.out === 'string' ? String(args.out) : DEFAULT_OUT;
    const stamp = timestamp();
    const backupDir = path.join(outDir, `${dbName}-${stamp}`);
    const manifest: Record<string, unknown> = {
        db: dbName,
        createdAt: new Date().toISOString(),
        host: os.hostname(),
        node: process.version,
        collections: {} as Record<string, number>,
    };

    if (args['dry-run']) {
        console.log(`☁️   ${dbName} · ${collections.length} collection(s) would be backed up:`);
        for (const name of collections) {
            const count = await db.collection(name).countDocuments({});
            console.log(`   - ${name} (${count} docs)`);
        }
        await disconnect();
        return;
    }

    fs.mkdirSync(backupDir, { recursive: true });

    console.log(`☁️   Backing up "${dbName}" -> ${backupDir}`);
    for (const name of collections) {
        const outFile = path.join(backupDir, `${name}.json.gz`);
        const count = await backupCollection(db, name, outFile);
        (manifest.collections as Record<string, number>)[name] = count;
        console.log(`   ✓ ${name} (${count} docs)`);
    }

    writeGzip(path.join(backupDir, 'MANIFEST.json.gz'), JSON.stringify(manifest, null, 2));
    console.log(`   ✓ MANIFEST.json.gz`);
    console.log(`✅ Backup completed.`);

    if (typeof args.keep === 'string' || (args.keep as unknown) === true) {
        const keep = typeof args.keep === 'string' ? Number(args.keep) : NaN;
        if (Number.isFinite(keep) && keep > 0) {
            await prune(outDir, keep);
        }
    }

    await disconnect();
}

async function prune(outDir: string, keep: number): Promise<void> {
    if (!fs.existsSync(outDir)) return;
    const TIMESTAMP_RE = /-\d{8}T\d{6}$/;
    const dirs = fs.readdirSync(outDir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && TIMESTAMP_RE.test(e.name))
        .map((e) => path.join(outDir, e.name))
        .sort()
        .reverse();
    const toDelete = dirs.slice(keep);
    for (const dir of toDelete) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`   🧹 pruned ${path.basename(dir)}`);
    }
}

main().catch((err) => {
    console.error('❌ Backup failed:', err);
    process.exit(1);
});