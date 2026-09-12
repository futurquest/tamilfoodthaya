import type { Db } from 'mongodb';
import { Migration } from './types';

/**
 * 20240912-base-query-indexes
 *
 * Creates the indexes the app queries on most often that are not guaranteed
 * by schema definitions (Mongoose creates `unique` indexes on user fields at
 * boot, but these convenient lookups were never indexed).
 *
 * Idempotent: `createIndex` is a no-op when the index already exists.
 */
const migration: Migration = {
    name: '20240912-base-query-indexes',
    up: async (db: Db) => {
        await db.collection('menuitems').createIndex({ categoryId: 1 });
        await db.collection('menuitems').createIndex({ available: 1 });
        await db.collection('orders').createIndex({ status: 1 });
        await db.collection('orders').createIndex({ createdAt: 1 });
        await db.collection('cateringorders').createIndex({ status: 1 });
        await db.collection('cateringorders').createIndex({ createdAt: 1 });
        await db.collection('leads').createIndex({ createdAt: 1 });
        await db.collection('categories').createIndex({ name: 1 });
        await db.collection('users').createIndex({ role: 1 });
    },
    down: async (db: Db) => {
        await db.collection('menuitems').dropIndex('categoryId_1').catch(() => {});
        await db.collection('menuitems').dropIndex('available_1').catch(() => {});
        await db.collection('orders').dropIndex('status_1').catch(() => {});
        await db.collection('orders').dropIndex('createdAt_1').catch(() => {});
        await db.collection('cateringorders').dropIndex('status_1').catch(() => {});
        await db.collection('cateringorders').dropIndex('createdAt_1').catch(() => {});
        await db.collection('leads').dropIndex('createdAt_1').catch(() => {});
        await db.collection('categories').dropIndex('name_1').catch(() => {});
        await db.collection('users').dropIndex('role_1').catch(() => {});
    },
};

export default migration;