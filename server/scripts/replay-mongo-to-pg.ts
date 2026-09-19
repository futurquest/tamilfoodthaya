import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';
import { DataSource } from 'typeorm';

/**
 * One-time replay of live Mongo data -> the Postgres sandbox.
 *
 *   npm run db:replay
 *
 * Reads every legacy collection from `MONGODB_URI` (tamilfoodthaya-database-1)
 * and cold-copies the docs into the TypeORM/Postgres tables created from the
 * new entities (24-hex `_id` varchar PKs, jsonb columns). `_id` is preserved
 * verbatim so existing JWT `sub`s / order / user references stay valid.
 *
 * Idempotent: `INSERT ... ON CONFLICT (_id) DO NOTHING`. Re-running is safe;
 * rows already written by the running (Postgres) server are left untouched.
 * The legacy Mongo stores stay writable until the final cut-over.
 */

function resolveEnvFile(): string {
    const candidates = [
        path.resolve(__dirname, '../.env'),
        path.resolve(process.cwd(), '.env'),
    ];
    const existing = candidates.find((file) => fs.existsSync(file));
    return existing || candidates[0];
}

interface TableSpec {
    table: string;
    mongoCandidates: string[];
    /** [pgColumn, mongoField] — identity unless an override is listed. */
    columns: [string, string][];
}

const TABLES: TableSpec[] = [
    {
        table: 'users',
        mongoCandidates: ['users'],
        columns: [
            ['_id', '_id'], ['username', 'username'], ['name', 'name'], ['phone', 'phone'],
            ['address', 'address'], ['eventPreferences', 'eventPreferences'], ['email', 'email'],
            ['password', 'password'], ['role', 'role'], ['resetPasswordToken', 'resetPasswordToken'],
            ['resetPasswordExpires', 'resetPasswordExpires'], ['isVerified', 'isVerified'],
            ['verificationPin', 'verificationPin'], ['verificationPinExpires', 'verificationPinExpires'],
            ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
    {
        table: 'categories',
        mongoCandidates: ['categories'],
        columns: [
            ['_id', '_id'], ['name', 'name'], ['nameTranslations', 'nameTranslations'],
            ['type', 'type'], ['order', 'order'], ['isActive', 'isActive'],
        ],
    },
    {
        table: 'menu_items',
        mongoCandidates: ['menuitems', 'menuitems', 'menu_items'],
        columns: [
            ['_id', '_id'], ['name', 'name'], ['NameTranslations', 'nameTranslations'],
            ['description', 'description'], ['DescriptionTranslations', 'descriptionTranslations'],
            ['price', 'price'], ['image', 'image'], ['categoryId', 'categoryId'],
            ['spiceLevel', 'spiceLevel'], ['available', 'available'], ['isVeg', 'isVeg'],
            ['stockCount', 'stockCount'], ['dailyAvailability', 'dailyAvailability'],
            ['isActive', 'isActive'], ['choices', 'choices'],
            ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
    {
        table: 'orders',
        mongoCandidates: ['orders'],
        columns: [
            ['_id', '_id'], ['userId', 'userId'], ['items', 'items'], ['total', 'total'],
            ['status', 'status'], ['pickupTime', 'pickupTime'], ['customerInfo', 'customerInfo'],
            ['paymentStatus', 'paymentStatus'], ['stripeSessionId', 'stripeSessionId'],
            ['utmSource', 'utmSource'], ['couponCode', 'couponCode'], ['isActive', 'isActive'],
            ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
    {
        table: 'catering_orders',
        mongoCandidates: ['cateringorders', 'catering_orders'],
        columns: [
            ['_id', '_id'], ['userId', 'userId'], ['packageId', 'packageId'],
            ['packageName', 'packageName'], ['selections', 'selections'], ['guests', 'guests'],
            ['eventDate', 'eventDate'], ['eventLocation', 'eventLocation'],
            ['pricePerPerson', 'pricePerPerson'], ['totalPrice', 'totalPrice'],
            ['customerInfo', 'customerInfo'], ['status', 'status'],
            ['paymentStatus', 'paymentStatus'], ['stripeSessionId', 'stripeSessionId'],
            ['isActive', 'isActive'], ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
    {
        table: 'catering_packages',
        mongoCandidates: ['cateringpackages', 'catering_packages'],
        columns: [
            ['_id', '_id'], ['name', 'name'], ['nameTranslations', 'nameTranslations'],
            ['description', 'description'], ['descriptionTranslations', 'descriptionTranslations'],
            ['basePrice', 'basePrice'], ['minGuests', 'minGuests'], ['maxGuests', 'maxGuests'],
            ['categories', 'categories'], ['image', 'image'], ['available', 'available'],
            ['isActive', 'isActive'], ['sortOrder', 'sortOrder'],
            ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
    {
        table: 'catering_quotes',
        mongoCandidates: ['cateringquotes', 'catering_quotes', 'cateringquote'],
        columns: [
            ['_id', '_id'], ['name', 'name'], ['email', 'email'], ['phone', 'phone'],
            ['eventDate', 'eventDate'], ['guests', 'guests'], ['location', 'location'],
            ['budgetRange', 'budgetRange'], ['eventType', 'eventType'], ['notes', 'notes'],
            ['utmSource', 'utmSource'], ['campaign', 'campaign'],
            ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
    {
        table: 'change_requests',
        mongoCandidates: ['changerequests', 'change_requests'],
        columns: [
            ['_id', '_id'], ['userId', 'userId'], ['orderId', 'orderId'],
            ['requestedChanges', 'requestedChanges'], ['status', 'status'],
            ['adminNotes', 'adminNotes'], ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
    {
        table: 'coupons',
        mongoCandidates: ['coupons'],
        columns: [
            ['_id', '_id'], ['code', 'code'], ['discountType', 'discountType'],
            ['discountValue', 'discountValue'], ['minOrderAmount', 'minOrderAmount'],
            ['minOrderAmount', 'minOrder'], ['maxUses', 'maxUses'], ['usedCount', 'usedCount'],
            ['validFrom', 'validFrom'], ['validUntil', 'validUntil'], ['isActive', 'isActive'],
            ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
    {
        table: 'addons',
        mongoCandidates: ['addons'],
        columns: [
            ['_id', '_id'], ['name', 'name'], ['nameTranslations', 'nameTranslations'],
            ['description', 'description'], ['descriptionTranslations', 'descriptionTranslations'],
            ['price', 'price'], ['pricingType', 'pricingType'], ['category', 'category'],
            ['isActive', 'isActive'], ['sortOrder', 'sortOrder'],
            ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
    {
        table: 'leads',
        mongoCandidates: ['leads'],
        columns: [
            ['_id', '_id'], ['name', 'name'], ['email', 'email'], ['phone', 'phone'],
            ['eventDate', 'eventDate'], ['guests', 'guests'], ['location', 'location'],
            ['message', 'message'], ['package', 'package'], ['utmSource', 'utmSource'],
            ['campaign', 'campaign'], ['status', 'status'], ['isActive', 'isActive'],
            ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
    {
        table: 'messages',
        mongoCandidates: ['messages'],
        columns: [
            ['_id', '_id'], ['name', 'name'], ['email', 'email'], ['phone', 'phone'],
            ['message', 'message'], ['read', 'read'], ['isActive', 'isActive'],
            ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
    {
        table: 'settings',
        mongoCandidates: ['settings'],
        columns: [
            ['_id', '_id'], ['siteName', 'siteName'], ['address', 'address'], ['phone', 'phone'],
            ['email', 'email'], ['whatsapp', 'whatsapp'], ['businessHours', 'businessHours'],
            ['facebookUrl', 'facebookUrl'], ['instagramUrl', 'instagramUrl'],
            ['ordersEnabled', 'ordersEnabled'], ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
    {
        table: 'notification_logs',
        mongoCandidates: ['notificationlogs', 'notification_logs'],
        columns: [
            ['_id', '_id'], ['eventId', 'eventId'], ['userId', 'userId'],
            ['referenceId', 'referenceId'], ['type', 'type'], ['status', 'status'],
            ['errorMessage', 'errorMessage'], ['payload', 'payload'], ['isCleared', 'isCleared'],
            ['createdAt', 'createdAt'], ['updatedAt', 'updatedAt'],
        ],
    },
];

function deepClean(v: any): any {
    if (v === undefined) return null;
    if (v === null) return null;
    if (v instanceof Date) return v;
    const t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') return v;
    // BSON ObjectId / Binary / Buffers exposed by the native driver.
    if (typeof v.toHexString === 'function') return v.toHexString();
    if (Array.isArray(v)) return v.map(deepClean);
    if (t === 'object') {
        const out: Record<string, any> = {};
        for (const key of Object.keys(v)) {
            out[key] = deepClean((v as any)[key]);
        }
        return out;
    }
    return null;
}

function parseConstantDefault(raw: string | null): any {
    if (!raw) return null;
    const s = raw.trim();
    if (/^(CURRENT_TIMESTAMP|now\(\))$/i.test(s)) return new Date();
    if (/^true$/i.test(s)) return true;
    if (/^false$/i.test(s)) return false;
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    const m = s.match(/^'((?:[^']|'')*)'(?:::.*)?$/);
    if (m) return m[1].replace(/''/g, "'");
    return null;
}

function mapRow(doc: any, columns: [string, string][], jsonbColumns: ReadonlySet<string>, defaultByColumn: Map<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [pgColumn, mongoField] of columns) {
        const raw = doc[mongoField];
        const fromDefault = raw === undefined;
        let value: any = fromDefault ? (defaultByColumn.get(pgColumn) ?? null) : deepClean(raw);
        if (value !== null && value !== undefined && jsonbColumns.has(pgColumn) && !fromDefault) {
            value = JSON.stringify(value);
        }
        out[pgColumn] = value;
    }
    return out;
}

async function loadColumnMetadata(ds: DataSource): Promise<{ jsonb: Set<string>; defaults: Map<string, any> }> {
    const rows: Array<{ table_name: string; column_name: string; data_type: string; column_default: string | null }> = await ds.query(
        `SELECT table_name, column_name, data_type, column_default FROM information_schema.columns WHERE table_schema = 'public'`,
    );
    const jsonb = new Set<string>();
    const defaults = new Map<string, any>();
    for (const r of rows) {
        if (r.data_type === 'jsonb') jsonb.add(r.column_name);
        const parsed = parseConstantDefault(r.column_default);
        if (parsed !== null) defaults.set(r.column_name, parsed);
        if (r.data_type === 'boolean' && r.column_default === null) defaults.set(r.column_name, null);
    }
    return { jsonb, defaults };
}

async function main(): Promise<void> {
    (await import('dotenv')).config({ path: resolveEnvFile() });

    const mongodbUri = process.env.MONGODB_URI;
    const pgHost = process.env.POSTGRES_HOST;
    const pgPort = process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5433;
    const pgUser = process.env.POSTGRES_USER;
    const pgPassword = process.env.POSTGRES_PASSWORD;
    const pgDb = process.env.POSTGRES_DB;

    if (!mongodbUri) {
        console.error('❌ MONGODB_URI is not set. Check your .env file.');
        process.exit(1);
    }
    if (!pgHost || !pgUser || !pgPassword || !pgDb) {
        console.error('❌ POSTGRES_* env vars are not set. Check your .env file.');
        process.exit(1);
    }

    console.log(`Connecting to Mongo: ${mongodbUri}`);
    await mongoose.connect(mongodbUri);
    const db = mongoose.connection.db;
    if (!db) {
        console.error('❌ Could not obtain a native database handle.');
        process.exit(1);
    }

    const collectionNames = new Set((await db.listCollections().toArray()).map((c) => c.name));

    const dataSource = new DataSource({
        type: 'postgres',
        host: pgHost,
        port: pgPort,
        username: pgUser,
        password: pgPassword,
        database: pgDb,
        entities: [],
        synchronize: false,
        ssl: false,
    });
    console.log(`Connecting to Postgres: ${pgHost}:${pgPort}/${pgDb}`);
    await dataSource.initialize();
    const { jsonb: jsonbColumns, defaults: defaultByColumn } = await loadColumnMetadata(dataSource);

    let anyFailed = false;
    const summary: string[] = [];

    for (const spec of TABLES) {
        const mongoName = spec.mongoCandidates.find((n) => collectionNames.has(n));
        if (!mongoName) {
            summary.push(`skipped   ${spec.table.padEnd(20)} (no Mongo collection found)`);
            continue;
        }

        const docs = await db.collection(mongoName).find({}).toArray();
        const rows = docs.map((doc) => mapRow(doc, spec.columns, jsonbColumns, defaultByColumn));

        console.log(`→ ${spec.table} from "${mongoName}": ${rows.length} docs`);

        let inserted = 0;
        let failed = 0;
        const BATCH = 500;
        for (let i = 0; i < rows.length; i += BATCH) {
            const chunk = rows.slice(i, i + BATCH);
            try {
                await dataSource
                    .createQueryBuilder()
                    .insert()
                    .into(spec.table)
                    .values(chunk)
                    .orIgnore()
                    .execute();
                inserted += chunk.length;
            } catch (err) {
                failed += chunk.length;
                console.error(`  ✗ insert chunk ${i / BATCH} failed: ${(err as Error).message}`);
                anyFailed = true;
            }
        }

        summary.push(
            failed > 0
                ? `failed    ${spec.table.padEnd(20)} read ${rows.length}, inserted ${inserted}, failed ${failed}`
                : `ok        ${spec.table.padEnd(20)} read ${rows.length}, inserted ${inserted}`,
        );
    }

    console.log('\n=== Replay summary ===');
    for (const line of summary) console.log(line);

    await dataSource.destroy();
    await mongoose.disconnect();

    if (anyFailed) {
        console.error('❌ Replay finished with failures (see above).');
        process.exit(1);
    }
    console.log('✅ Replay complete (idempotent — safe to re-run).');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Replay crashed:', err);
    process.exit(1);
});