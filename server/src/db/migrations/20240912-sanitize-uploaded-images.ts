import type { Db } from 'mongodb';
import { Migration } from './types';

/**
 * 20240912-sanitize-uploaded-images
 *
 * Menus can carry placeholder/corrupt URLs that break the UI (e.g. a literal
 * "h" stored in the image field). This normalizes them:
 *   - `undefined`, `null` or empty strings stay empty (client falls back to a
 *     placeholder).
 *   - valid http(s), data:, or blob: URLs are kept untouched.
 *   - everything else (garbage, relative paths, corrupt values) is dropped so
 *     the UI shows the placeholder instead of a broken image.
 */
const VALID_IMAGE_RE = /^(https?:\/\/|data:image\/|blob:)/;

const migration: Migration = {
    name: '20240912-sanitize-uploaded-images',
    up: async (db: Db) => {
        const menuItems = await db
            .collection('menuitems')
            .find({ image: { $exists: true } })
            .project({ image: 1 })
            .toArray();

        for (const item of menuItems) {
            const img = (item as unknown as { image: unknown }).image;
            const isClean =
                img === null ||
                img === undefined ||
                img === '' ||
                (typeof img === 'string' && VALID_IMAGE_RE.test(img));

            if (!isClean) {
                await db.collection('menuitems').updateOne(
                    { _id: (item as unknown as { _id: unknown })._id as never },
                    { $set: { image: '' } },
                );
            }
        }
    },
    down: async (db: Db) => {
        // No-op: normalized images cannot be un-normalized reliably.
    },
};

export default migration;