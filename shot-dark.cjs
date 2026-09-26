const { chromium } = require('C:/Users/thanu/Documents/tamilfooddemo/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('preferred-theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('theme-dark');
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'C:/Users/thanu/Documents/tamilfooddemo/fullpage-dark.png', fullPage: true });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
