import { test, expect } from '@playwright/test';

const pkg = { _id: 'package-1', name: 'Tamil celebration', description: 'Traditional dishes for your gathering.', basePrice: 25, minGuests: 20, available: true, pricingModel: 'per_person' };
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('i18nextLng', 'en'); localStorage.setItem('theme', 'light'); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/v1/**', route => {
    const url = route.request().url();
    if (url.endsWith('/settings')) return route.fulfill({ json: {} });
    if (url.endsWith('/catering/packages')) return route.fulfill({ json: [pkg] });
    if (url.endsWith('/users/dashboard')) return route.fulfill({ json: { active: {}, history: {}, recentNotifications: [] } });
    return route.fulfill({ json: [] });
  });
});

for (const width of [360, 768, 1440]) {
  test(`public landing pages fit ${width}px and expose one metadata set`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/menu', '/catering', '/contact']) {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://demo.example${path}`);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.getByRole('link', { name: 'Request a catering quote', exact: true }).last()).toBeVisible();
    }
  });
}

test('enquiry preserves details on failure and confirms success', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Request a catering quote' }).click();
  await expect(page.locator('#name-error')).toBeVisible();
  await page.locator('input[name="name"]').fill('demo');
  await page.locator('input[name="email"]').fill('demo@example.com');
  await page.locator('input[name="phone"]').fill('demo');
  await page.locator('input[name="guests"]').fill('50');
  await page.locator('input[name="location"]').fill('demo');
  await page.locator('textarea[name="message"]').fill('Tamil vegetarian catering for a family celebration.');
  await page.route('**/api/v1/leads', route => route.fulfill({ status: 500, json: {} }));
  await page.getByRole('button', { name: 'Request a catering quote' }).click();
  await expect(page.locator('.form-result--error')).toBeVisible();
  await expect(page.locator('input[name="name"]')).toHaveValue('demo');
  await page.route('**/api/v1/leads', route => {
    expect(route.request().postDataJSON()).toMatchObject({ guests: '50', location: 'demo' });
    return route.fulfill({ json: { ok: true } });
  });
  await page.getByRole('button', { name: 'Request a catering quote' }).click();
  await expect(page.locator('.form-result--success')).toBeVisible();
});

test('menu search and catering route work', async ({ page }) => {
  await page.goto('/menu');
  await page.getByRole('searchbox').fill('no-such-dish');
  await expect(page.locator('.empty-panel')).toBeVisible();
  await page.locator('.page-hero').getByRole('link', { name: 'Explore catering packages' }).click();
  await expect(page).toHaveURL(/\/catering#packages-section$/);
  await expect(page.locator('#packages-section')).toBeVisible();
});

test('private dashboards fit a phone and stay noindex', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fixture-token');
    localStorage.setItem('user', JSON.stringify({ role: 'admin', username: 'Preview' }));
  });
  for (const path of ['/dashboard', '/admin/dashboard']) {
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('language switching updates document semantics', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('i18nextLng', 'ta'));
  await page.goto('/contact');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ta');
  await expect(page.locator('h1')).not.toContainText('contactPage');
});

test('mobile navigation stays reachable and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Open menu', exact: true });
  await expect(toggle).toBeInViewport();
  await toggle.click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
});
