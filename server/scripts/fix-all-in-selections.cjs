const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

const packageId = '699b7fc8bc66bbbc597512c6';
const categoryName = 'Drinken & Starters';

async function main() {
    const db = new Client({
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
    });

    await db.connect();
    try {
        await db.query('BEGIN');
        const result = await db.query(
            'SELECT name, categories FROM catering_packages WHERE _id = $1 FOR UPDATE',
            [packageId],
        );
        if (result.rowCount !== 1 || result.rows[0].name !== 'All-in Pakket') {
            throw new Error('Expected All-in Pakket was not found');
        }

        const before = result.rows[0].categories;
        const matches = before.filter((category) => category.name === categoryName);
        if (matches.length !== 1) {
            throw new Error('Expected category was not found exactly once');
        }
        const category = matches[0];
        if (category.minSelect === 8 && category.maxSelect === 8) {
            await db.query('COMMIT');
            console.log('All-in Pakket already requires all 8 choices');
            return;
        }
        if (
            category.minSelect !== 0 || category.maxSelect !== 10 ||
            category.items.length !== 8 ||
            new Set(category.items.map((item) => item.menuItem)).size !== 8
        ) {
            throw new Error('Category has changed; review its selection rules before updating');
        }

        const after = before.map((item) => item.name === categoryName
            ? { ...item, minSelect: 8, maxSelect: 8 }
            : item);
        const updated = await db.query(
            'UPDATE catering_packages SET categories = $2::jsonb WHERE _id = $1 AND categories = $3::jsonb RETURNING _id',
            [packageId, JSON.stringify(after), JSON.stringify(before)],
        );
        if (updated.rowCount !== 1) {
            throw new Error('Package changed while updating');
        }
        await db.query('COMMIT');
        console.log('All-in Pakket now requires all 8 Drinken & Starters choices');
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    } finally {
        await db.end();
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
