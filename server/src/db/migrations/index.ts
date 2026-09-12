import baselineMenuShape from './20240912-baseline-menu-document-shape';
import sanitizeImages from './20240912-sanitize-uploaded-images';
import baseQueryIndexes from './20240912-base-query-indexes';
import { Migration } from './types';

/**
 * Migration registry. Order matters: run oldest first, one per entry.
 * A new migration made with `migrate.ts create <name>` is added here
 * automatically by the scaffolder.
 */
const migrations: Migration[] = [
    baselineMenuShape,
    sanitizeImages,
    baseQueryIndexes,
];

export default migrations;