import { test, expect } from '@playwright/test';

test('home hero and public navigation work across viewports and languages', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', error => failures.push(error.message));

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('http://127.0.0.1:5173/');
    await expect(page.locator('.home-hero__backdrop img')).toBeVisible();
    await expect(page.locator('.home-hero h1')).toBeVisible();
    await expect(page.locator('.home-hero__actions a[href="/catering#packages-section"]').first()).toBeVisible();
    await expect(page.locator('.home-hero__actions a[href="/menu"]').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBe(false);
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: false });
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => localStorage.setItem('theme', value), theme);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const homeBackground = await page.locator('.home-hero').evaluate((element) => getComputedStyle(element).backgroundImage);
      const homeButtonBackground = await page.locator('.home-hero .btn-primary').evaluate((element) => getComputedStyle(element).backgroundColor);
      await page.goto('http://127.0.0.1:5173/catering');
      const packageBackground = await page.locator('#packages-section').evaluate((element) => getComputedStyle(element).backgroundImage);
      const packageButtonBackground = await page.locator('.catering-hero .btn-primary').evaluate((element) => getComputedStyle(element).backgroundColor);
      expect(homeBackground).toBe(packageBackground);
      expect(homeButtonBackground).toBe(packageButtonBackground);
      await page.goto('http://127.0.0.1:5173/');
      await expect(page.locator('.home-hero__backdrop img')).toBeVisible();
      await page.screenshot({ path: `test-results/home-${width}-${theme}.png`, fullPage: false });
    }
  }

  for (const language of ['nl', 'ta']) {
    await page.evaluate((lang) => localStorage.setItem('i18nextLng', lang), language);
    await page.reload();
    await expect(page.locator('.home-hero h1')).toBeVisible();
    await expect(page.locator('.about-section h2')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow, `horizontal overflow in ${language}`).toBe(false);
  }

  await page.goto('http://127.0.0.1:5173/');
  await page.locator('.home-hero__actions a[href="/menu"]').first().click();
  await expect(page).toHaveURL(/\/menu$/);
  await page.goto('http://127.0.0.1:5173/');
  await page.locator('.home-hero__actions a[href="/catering#packages-section"]').first().click();
  await expect(page).toHaveURL(/\/catering#packages-section$/);

  expect(failures).toEqual([]);
});
