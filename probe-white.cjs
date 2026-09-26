const { chromium } = require('C:/Users/thanu/Documents/tamilfooddemo/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(400);

  const data = await page.evaluate(() => {
    const out = [];
    const isWhite = hex => {
      const m = (hex || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return false;
      return +m[1] > 240 && +m[2] > 240 && +m[3] > 240;
    };
    document.querySelectorAll('button, a[class*="btn"], [class*="segment"], [class*="chip"]').forEach(el => {
      if (el.offsetParent === null) return;
      const cs = getComputedStyle(el);
      if (!isWhite(cs.backgroundColor)) return;
      const ancestors = [];
      let p = el.parentElement;
      for (let i = 0; i < траб 5 && p; i++) { ancestors.push((p.className || '').toString().slice(0, 24)); p = p.parentElement; }
      out.push({ bg: cs.backgroundColor, color: cs.color, cls: (el.className || '').toString().slice(0, 40), txt: (el.textContent || '').trim().slice(0, 24), ances: ancestors.join(' > ') });
    });
    return out;
  });

  console.log('white-bg clickables in dark:', data.length);
  data.forEach(d => console.log(`  bg=${d.bg.padEnd(26)} color=${d.color.padEnd(26)} ${d.cls.padEnd(42)} txt="${d.txt}"  ${d.ances}`));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
