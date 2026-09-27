require('dotenv/config');
const { Client } = require('pg');
const jwt = require('jsonwebtoken');
const { promises: fs } = require('node:fs');
const { join, basename } = require('node:path');

async function main() {
  if (!/^tft_restore_test_[a-z0-9_]+$/.test(process.env.POSTGRES_DB || '')) throw new Error('Requires an isolated restore test DB');
  const db = new Client({ host: process.env.POSTGRES_HOST, port: Number(process.env.POSTGRES_PORT || 5432), user: process.env.POSTGRES_USER, password: process.env.POSTGRES_PASSWORD, database: process.env.POSTGRES_DB });
  await db.connect();
  let created;
  const name = `security-upload-probe-${Date.now()}`;
  try {
    const admin = (await db.query("SELECT _id, username, role FROM users WHERE role = 'admin' LIMIT 1")).rows[0];
    const category = (await db.query('SELECT _id FROM categories LIMIT 1')).rows[0];
    if (!admin || !category) throw new Error('Test admin or category missing');
    const token = jwt.sign({ sub: admin._id, username: admin.username, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1m' });
    const form = new FormData();
    form.set('name', name);
    form.set('price', '1');
    form.set('categoryId', category._id);
    form.set('image', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXsAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' }), 'probe.png');
    const response = await fetch('http://localhost:3006/api/v1/menu/items', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: form });
    if (response.status !== 201) throw new Error(`Valid image upload returned ${response.status}`);
    created = await response.json();
    if (!created._id || !created.image) throw new Error('Upload response omitted item or image');
    const imageResponse = await fetch(created.image);
    if (imageResponse.status !== 200 || imageResponse.headers.get('content-type')?.includes('image/png') !== true) throw new Error('Uploaded image is not served');
    console.log('Valid PNG upload and static serving VERIFIED on isolated test DB.');
  } finally {
    if (created?._id) await db.query('DELETE FROM menu_items WHERE _id = $1 AND name = $2', [created._id, name]);
    if (created?.image) {
      const filename = basename(new URL(created.image).pathname);
      if (/^[0-9a-f]{32}\.png$/.test(filename)) await fs.rm(join(process.cwd(), 'uploads', 'menu', filename), { force: true });
    }
    await db.end();
  }
}

main().catch((error) => { console.error(`Upload smoke failed: ${error.message}`); process.exitCode = 1; });
