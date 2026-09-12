import { test, expect } from '@playwright/test';

const settings = {
    address: 'Hofplein 20, Rotterdam',
    phone: '+31 (0) 6 1234 5678',
    email: 'info@tamilfoodthaya.nl',
    businessHours: {
        monday: '12:00 - 22:00',
        tuesday: '12:00 - 22:00',
        wednesday: '12:00 - 22:00',
        thursday: '12:00 - 22:00',
        friday: '12:00 - 22:00',
        saturday: '12:00 - 22:00',
        sunday: '12:00 - 22:00',
    },
};

const categories = [{ _id: 'cat-1', name: 'Mains', type: 'food', order: 1 }];
const menuItems = [{
    _id: 'item-1',
    name: 'Mutton Kottu Roti',
    description: 'Chopped roti with mutton, egg, vegetables and Tamil spices.',
    price: 14.5,
    categoryId: 'cat-1',
    spiceLevel: 2,
    image: 'https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?auto=format&fit=crop&q=80&w=600',
    stockCount: 12,
    available: true,
}];

const packages = [{
    _id: 'pkg-1',
    name: 'Gold Catering',
    description: 'A warm Tamil catering package for gatherings.',
    basePrice: 22.5,
    minGuests: 20,
    maxGuests: 150,
    available: true,
    categories: [{ name: 'Main dishes', items: menuItems }],
}];

test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/settings', route => route.fulfill({ json: settings }));
    await page.route('**/api/v1/menu/categories', route => route.fulfill({ json: categories }));
    await page.route('**/api/v1/menu/items', route => route.fulfill({ json: menuItems }));
    await page.route('**/api/v1/orders/checkout', route => route.fulfill({ json: { url: 'http://example.com/pay' } }));
    await page.route('**/api/v1/catering/packages', route => route.fulfill({ json: packages }));
    await page.route('**/api/v1/leads', route => route.fulfill({ json: { ok: true } }));
});

test.describe('Ordering Flow', () => {
    test('allows a user to add an item to cart and reach checkout', async ({ page }) => {
        await page.goto('/menu');

        await page.getByRole('button', { name: /toevoegen aan mandje|add to cart/i }).first().click();
        await page.getByLabel('Open cart').first().click();

        await expect(page.getByRole('heading', { name: /jouw mandje/i })).toBeVisible();
        await expect(page.getByRole('complementary', { name: 'Shopping cart' }).getByText('Mutton Kottu Roti')).toBeVisible();

        await page.getByRole('button', { name: 'Afrekenen' }).click();
        await expect(page).toHaveURL(/.*checkout/);

        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="phone"]', '0612345678');
        await page.fill('input[name="pickupTime"]', '2026-12-25T18:00');

        await expect(page.getByRole('button', { name: /doorgaan naar betalen/i })).toBeVisible();
    });
});

test.describe('Catering Flow', () => {
    test('allows a user to request a catering quote', async ({ page }) => {
        await page.goto('/catering');

        await page.fill('input[name="name"]', 'Sarah Miller');
        await page.fill('input[name="phone"]', '0612345678');
        await page.fill('input[name="email"]', 'sarah@example.com');
        await page.fill('input[name="eventDate"]', '2026-08-15');
        await page.fill('input[name="eventType"]', 'Wedding');
        await page.fill('input[name="guests"]', '150');
        await page.fill('input[name="location"]', 'Rotterdam');

        await page.getByRole('button', { name: /offerte aanvragen|request quote/i }).last().click();
        await expect(page.getByRole('status').filter({ hasText: /binnen 24 uur|within 24 hours/i })).toBeVisible();
    });
});
