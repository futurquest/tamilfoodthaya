import { test, expect } from '@playwright/test';

test.describe('Ordering Flow', () => {
    test('should allow user to add item to cart and see checkout', async ({ page }) => {
        // 1. Go to menu page
        await page.goto('/menu');

        // 2. Add an item
        const addToCartButton = page.locator('button:has-text("Toevoegen to Cart")').first();
        await addToCartButton.click();

        // 3. Open cart drawer
        await page.click('button:has-text("Mandje")');
        await expect(page.locator('h2:has-text("Jouw Mandje")')).toBeVisible();

        // 4. Go to checkout
        await page.click('button:has-text("Afrekenen")');
        await expect(page).toHaveURL(/.*checkout/);

        // 5. Fill form
        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="phone"]', '0612345678');
        await page.fill('input[name="pickupTime"]', '2025-12-25T18:00');

        // 6. Check if "Doorgaan naar Betalen" button is visible
        await expect(page.locator('button:has-text("Doorgaan naar Betalen")')).toBeVisible();
    });
});

test.describe('Catering Flow', () => {
    test('should allow user to request a quote', async ({ page }) => {
        await page.goto('/catering');

        await page.fill('input[name="name"]', 'Sarah Miller');
        await page.fill('input[name="email"]', 'sarah@example.com');
        await page.fill('input[name="eventDate"]', '2026-08-15');
        await page.fill('input[name="guests"]', '150');
        await page.fill('input[name="location"]', 'Rotterdam');

        await page.click('button:has-text("Offerte Aanvragen")');

        // Check for success alert (our dummy logic uses alert)
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Bedankt');
            await dialog.dismiss();
        });
    });
});
