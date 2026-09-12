import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';
import mongoose from 'mongoose';

/**
 * The native-driver Db type, sourced from mongoose's own bundled driver so the
 * type always matches the runtime handle returned by connect() — importing the
 * top-level `mongodb` package would otherwise be a *different* type identity.
 */
export type Db = NonNullable<typeof mongoose.connection.db>;

/**
 * Shared connection bootstrap for database tooling scripts
 * (backup / restore / import / migrations).
 *
 * Loads server/.env (falling back to cwd/.env), connects via mongoose,
 * and exposes the native driver `Db` handle for schema-agnostic work.
 */

export function resolveEnvFile(): string {
    const candidates = [
        path.resolve(__dirname, '../../.env'),
        path.resolve(process.cwd(), '.env'),
    ];
    const existing = candidates.find((file) => fs.existsSync(file));
    return existing || candidates[0];
}

export async function connect(): Promise<Db> {
    const { config } = await import('dotenv');
    config({ path: resolveEnvFile() });

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI is not set. Check your .env file.');
        process.exit(1);
    }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    if (!db) {
        console.error('❌ Could not obtain a native database handle.');
        process.exit(1);
    }
    return db;
}

export async function disconnect(): Promise<void> {
    await mongoose.disconnect();
}

export function parseArgs(argv: string[]): Record<string, string | boolean> {
    const args: Record<string, string | boolean> = {};
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg.startsWith('--')) {
            const eq = arg.indexOf('=');
            if (eq > -1) {
                const key = arg.slice(2, eq);
                const value = arg.slice(eq + 1);
                args[key] = value || true;
            } else {
                const key = arg.slice(2);
                const next = argv[i + 1];
                if (next && !next.startsWith('--')) {
                    args[key] = next;
                    i++;
                } else {
                    args[key] = true;
                }
            }
        }
    }
    return args;
}