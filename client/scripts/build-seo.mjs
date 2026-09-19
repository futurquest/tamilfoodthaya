import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadEnv } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const env = loadEnv('production', root, 'VITE_');
const origin = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || 'https://tamilfoodthaya.nl').replace(/\/$/, '');
if (!/^https?:\/\/[^/]+$/.test(origin)) throw new Error('VITE_SITE_URL must be an absolute origin without a path.');
const translations = JSON.parse(await readFile(path.join(root, 'public/locales/nl/translation.json'), 'utf8'));
const output = path.join(root, 'dist');
const shell = await readFile(path.join(output, 'index.html'), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const routes = { '/': 'home2', '/catering': 'catering2', '/menu': 'menuPage', '/contact': 'contactPage' };
for (const [route, key] of Object.entries(routes)) {
  const page = translations[key];
  const title = `${page.seoTitle} | Tamil Food Thaya`;
  const metadata = `
    <title>${escape(title)}</title>
    <meta name="description" content="${escape(page.seoDescription)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${origin}${route}" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(page.seoDescription)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Tamil Food Thaya" />
    <meta property="og:locale" content="nl_NL" />
    <meta property="og:url" content="${origin}${route}" />
    <meta property="og:image" content="${origin}/hero-catering.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(title)}" />
    <meta name="twitter:description" content="${escape(page.seoDescription)}" />
    <meta name="twitter:image" content="${origin}/hero-catering.jpg" />`;
  let html = shell.replace(/<title>[\s\S]*?<\/title>/g, '').replace(/<meta\s+(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g, '').replace(/<link\s+rel="canonical"[^>]*>/g, '').replace('<html lang="en">', '<html lang="nl">').replace('</head>', metadata + '\n  </head>');
  if (route !== '/') html = html.replace(/<link rel="preload" as="image" href="\/hero-catering.jpg"[^>]*>/, '');
  const directory = path.join(output, route.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), html);
}
// Serve private route entry points with noindex before any JavaScript runs.
const privateRoutes = ['login', 'register', 'verify-email', 'dashboard', 'checkout', 'admin', ...['login', 'dashboard', 'leads', 'users', 'menu', 'categories', 'messages', 'settings', 'catering-packages', 'catering-orders', 'addons', 'coupons'].map(name => `admin/${name}`)];
for (const route of privateRoutes) {
  const directory = path.join(output, route);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), shell.replace(/<title>[\s\S]*?<\/title>/, '<title>Account | Tamil Food Thaya</title>').replace('</head>', '<meta name="robots" content="noindex, follow" /></head>'));
}
await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(routes).map(route => `\n  <url><loc>${origin}${route}</loc></url>`).join('')}\n</urlset>\n`);
await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log('Generated public route metadata, sitemap.xml and robots.txt.');
