import type { Db } from 'mongodb';
import { Migration } from './types';

/**
 * 20240912-baseline-menu-document-shape
 *
 * Backfills fields introduced to the MenuItem schema after existing documents
 * were created, so the whole collection matches the current schema:
 *   - isVeg             (default false)
 *   - dailyAvailability (default true)
 *   - price / stockCount (numbers, 0 if missing)
 */
const migration: Migration = {
    name: '20240912-baseline-menu-document-shape',
    up: async (db: Db) => {
        await db.collection('menuitems').updateMany(
            { isVeg: { $exists: false } },
            { $set: { isVeg: false } },
        );
        await db.collection('menuitems').updateMany(
            { dailyAvailability: { $exists: false } },
            { $set: { dailyAvailability: true } },
        );
        await db.collection('menuitems').updateMany(
            { price: { $exists: false } },
            { $set: { price: 0 } },
        );
        await db.collection('menuitems').updateMany(
            { stockCount: { $exists: false } },
            { $set: { stockCount: 0 } },
        );
    },
    down: async (db: Db) => {},
};

export default migration;