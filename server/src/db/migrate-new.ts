import * as fs from 'fs';
import * as path from 'path';

/**
 * Scaffolds a new migration file and registers it in the migrations index.
 *
 * Usage:
 *   ts-node src/db/migrate.ts create add-coupon-usage-fields
 */

const INDEX_PATH = path.resolve(__dirname, './migrations/index.ts');
const MIGRATIONS_DIR = path.resolve(__dirname, './migrations');

export async function createMigration(slugWithPrefix: string): Promise<string> {
    const slug = slugWithPrefix.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `${Date.now()}-${slug}`;
    const filePath = path.join(MIGRATIONS_DIR, `${filename}.ts`);
    const className = slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');

    const template = `import type { Db } from 'mongodb';
import { Migration } from './types';

const migration: Migration = {
    name: '${filename}',
    up: async (db: Db) => {
        // TODO: implement the forward migration
        // e.g. await db.collection('users').updateMany({}, { $set: { foo: 0 } });
    },
    down: async (db: Db) => {
        // TODO: (optional) implement the rollback
    },
};

export default migration;
`;

    if (fs.existsSync(filePath)) {
        throw new Error(`Migration already exists: ${filePath}`);
    }
    fs.writeFileSync(filePath, template, 'utf8');

    // Register in index.ts
    const indexPath = INDEX_PATH;
    const indexLines = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8').split('\n') : [];
    const importLine = `import ${className} from './${filename}';`;
    const entryLine = `    ${className},`;
    if (!indexLines.some((l) => l.includes(filename))) {
        // insert import after the last import; insert entry before the trailing `];`
        const importIdx = indexLines.findIndex((l) => l.trim().startsWith('import '));
        let insertImportAt = -1;
        for (let i = indexLines.length - 1; i >= 0; i--) {
            if (indexLines[i].trim().startsWith('import ')) {
                insertImportAt = i + 1;
                break;
            }
        }
        const closeIdx = indexLines.findIndex((l) => l.trim() === '];');
        if (insertImportAt >= 0) indexLines.splice(insertImportAt, 0, importLine);
        if (closeIdx >= 0) indexLines.splice(closeIdx, 0, entryLine);
        fs.writeFileSync(indexPath, indexLines.join('\n'), 'utf8');
    }

    console.log(`✅ Created ${filePath}`);
    return filePath;
}