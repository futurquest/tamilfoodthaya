import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { parseArgs } from './connection';

/**
 * Lists available backups and the collections inside each.
 *
 * Usage:
 *   ts-node src/db/list.ts             # all backups
 *   ts-node src/db/list.ts --details   # also show per-collection doc counts
 */

const DEFAULT_BACKUPS = path.resolve(__dirname, '../../backups');

function readGzip(file: string): string {
    return zlib.gunzipSync(fs.readFileSync(file)).toString('utf8');
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        console.log('Usage: ts-node src/db/list.ts [--details]');
        return;
    }

    if (!fs.existsSync(DEFAULT_BACKUPS)) {
        console.log('No backups found yet.');
        return;
    }

    const dirs = fs.readdirSync(DEFAULT_BACKUPS, { withFileTypes: true })
        .filter((e) => e.isDirectory() && /-\d{8}T\d{6}$/.test(e.name))
        .map((e) => e.name)
        .sort()
        .reverse();

    if (!dirs.length) {
        console.log('No backups found yet.');
        return;
    }

    console.log(`📁 Backups in ${DEFAULT_BACKUPS}`);
    for (const dirName of dirs) {
        const dirPath = path.join(DEFAULT_BACKUPS, dirName);
        const manifestPath = path.join(dirPath, 'MANIFEST.json.gz');

        let summary: { db?: string; createdAt?: string; collections?: Record<string, number> } = {};
        if (fs.existsSync(manifestPath)) {
            try {
                summary = JSON.parse(readGzip(manifestPath));
            } catch {
                summary = {};
            }
        }

        const totalDocs = Object.values(summary.collections || {}).reduce((a: number, b: number) => a + (b || 0), 0);
        console.log(`\n🗄️   ${dirName}`);
        console.log(`   db: ${summary.db || '?'} · created: ${summary.createdAt || '?'}`);
        console.log(`   collections: ${Object.keys(summary.collections || {}).length} · docs: ${totalDocs}`);

        if (args.details) {
            for (const [name, count] of Object.entries(summary.collections || {})) {
                console.log(`     • ${name}: ${count}`);
            }
        }
    }
}

main().catch((err) => {
    console.error('❌ list failed:', err);
    process.exit(1);
});