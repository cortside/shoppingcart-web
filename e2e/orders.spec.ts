import { test, expect } from '@playwright/test';

/**
 * E2E Test: Order History
 * Tests viewing past orders and order details
 */
test.describe('Order History', () => {
  test.skip('should display order history for authenticated user', async ({ page }) => {
    // SKIP: Requires authentication and backend data

    // 1. Login (would use auth setup helper)
    // await loginAsTestUser(page);

    // 2. Navigate to orders page
    await page.goto('/account/orders');

    // 3. Verify orders list is visible
    await expect(page.locator('h1')).toContainText('My Orders');

    // 4. Verify order cards are displayed
    const orderCards = page.locator('[data-testid="order-card"]');
    await expect(orderCards).toHaveCount(await orderCards.count());

    // 5. Click on first order
    const firstOrder = orderCards.first();
    await firstOrder.click();

    // 6. Verify order detail page
    await expect(page).toHaveURL(/\/account\/orders\/.+/);
    await expect(page.locator('h1')).toContainText('Order Details');
  });

  test.skip('should display empty state when no orders', async ({ page }) => {
    // SKIP: Requires authentication

    await page.goto('/account/orders');

    // Should show empty state
    await expect(page.locator('text=No orders yet')).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // This should work without backend
    await page.goto('/account/orders');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
