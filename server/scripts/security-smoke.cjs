require('dotenv/config');
const { Client } = require('pg');
const jwt = require('jsonwebtoken');
const { promises: fs } = require('node:fs');
const { join } = require('node:path');

async function main() {
  const database = process.env.POSTGRES_DB || '';
  const origin = process.env.SECURITY_SMOKE_URL || 'http://localhost:3005';
  if (!/^tft_restore_test_[a-z0-9_]+$/.test(database) || !/^http:\/\/localhost:3005$/.test(origin)) {
    throw new Error('Security smoke test requires the isolated restore database and localhost:3005');
  }
  const db = new Client({ host: process.env.POSTGRES_HOST, port: Number(process.env.POSTGRES_PORT || 5432), user: process.env.POSTGRES_USER, password: process.env.POSTGRES_PASSWORD, database });
  await db.connect();
  let user;
  let otherOrder;
  let admin;
  let category;
  try {
    user = (await db.query("SELECT _id, username, role FROM users WHERE username LIKE 'authprobe_%' ORDER BY \"createdAt\" DESC LIMIT 1")).rows[0];
    if (!user) throw new Error('No synthetic authprobe user found');
    otherOrder = (await db.query('SELECT _id FROM catering_orders WHERE "userId" IS DISTINCT FROM $1 LIMIT 1', [user._id])).rows[0];
    admin = (await db.query("SELECT _id, username, role FROM users WHERE role = 'admin' LIMIT 1")).rows[0];
    category = (await db.query('SELECT _id FROM categories LIMIT 1')).rows[0];
  } finally { await db.end(); }
  const token = jwt.sign({ sub: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1m' });
  const api = `${origin}/api/v1`;
  const results = {};
  results.unauthenticated = (await fetch(`${api}/users/profile`)).status;
  results.normalUserAdmin = (await fetch(`${api}/users`, { headers: { authorization: `Bearer ${token}` } })).status;
  results.otherUserOrder = otherOrder ? (await fetch(`${api}/catering/orders/${otherOrder._id}`, { headers: { authorization: `Bearer ${token}` } })).status : 'NOT TESTED';
  results.profileMassAssignment = (await fetch(`${api}/users/profile`, { method: 'PATCH', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ role: 'admin', resetPasswordToken: 'forged' }) })).status;
  results.cateringUserIdSpoof = (await fetch(`${api}/catering/orders`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: user._id }) })).status;
  const oversized = await fetch(`${api}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: 'probe', password: 'x'.repeat(105000) }) });
  results.oversizedBody = oversized.status;
  results.oversizedBodyLeaksStack = /stack|POSTGRES_PASSWORD|node_modules/i.test(await oversized.text());
  const cors = await fetch(`${api}/menu/items`, { headers: { origin: 'https://attacker.invalid' } });
  results.corsAllowedOrigin = cors.headers.get('access-control-allow-origin');
  results.frameHeader = cors.headers.get('x-frame-options');
  results.noSniff = cors.headers.get('x-content-type-options');
  const injection = await fetch(`${api}/menu/items/category/${encodeURIComponent("' OR 1=1--")}`);
  results.sqlInjectionStatus = injection.status;
  results.sqlInjectionRows = (await injection.json()).length;
  if (admin && category) {
    const adminToken = jwt.sign({ sub: admin._id, username: admin.username, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1m' });
    const uploadDir = join(process.cwd(), 'uploads', 'menu');
    const countUploads = async () => (await fs.readdir(uploadDir).catch(() => [])).length;
    const before = await countUploads();
    const form = new FormData();
    form.set('name', 'Fake image probe');
    form.set('price', '1');
    form.set('categoryId', category._id);
    form.set('image', new Blob(['<script>alert(1)</script>'], { type: 'image/png' }), 'fake.png');
    results.fakeImage = (await fetch(`${api}/menu/items`, { method: 'POST', headers: { authorization: `Bearer ${adminToken}` }, body: form })).status;
    results.fakeImageFilesCreated = (await countUploads()) - before;
  } else {
    results.fakeImage = 'NOT TESTED';
  }
  console.log(JSON.stringify(results));
  if (results.unauthenticated !== 401 || results.normalUserAdmin !== 403 || (otherOrder && results.otherUserOrder !== 404)
    || results.profileMassAssignment !== 400 || results.cateringUserIdSpoof !== 400 || results.oversizedBody !== 413 || results.oversizedBodyLeaksStack
    || results.corsAllowedOrigin !== null || results.noSniff !== 'nosniff' || results.sqlInjectionStatus !== 200 || results.sqlInjectionRows !== 0
    || (admin && category && (results.fakeImage !== 400 || results.fakeImageFilesCreated !== 0))) {
    process.exitCode = 1;
  }
}

main().catch((error) => { console.error(`Security smoke failed: ${error.message}`); process.exitCode = 1; });
