const { chromium } = require('C:/Users/thanu/Documents/tamilfoodthaya/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  // light theme is default; toggling to dark
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('theme-dark');
  });
  await page.waitForTimeout(800);

  const data = await page.evaluate(() => {
    const isWhite = (v, g) => {
      if (!v) return false;
      const m = v.match(/(\d+),\s*(\d+),\s*(\d+)/);
      return m ? +m[1] > 250 && +m[2] > 250 && +m[3] > 250 : false;
    };
    const out = [];
    document.querySelectorAll('button, a.btn').forEach(el => {
      if (el.offsetParent === null) return;
      const cs = getComputedStyle(el);
      const bg = isWhite(cs.backgroundColor);
      const fg = isWhite(cs.color);
      if (bg && fg) {
        out.push({ cls: (el.className || '').toString().slice(0, 44), bg: cs.backgroundColor, color: cs.color, txt: (el.textContent || '').trim().slice(0, 28) });
      }
    });
    return out;
  });

  console.log('whiteOnWhite count:', data.length);
  data.forEach(b => console.log('  ' + b.bg.padEnd(30) + b.color.padEnd(30) + b.cls + ' txt="' + b.txt + '"'));

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
