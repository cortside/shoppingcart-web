import { test, expect } from '@playwright/test';

/**
 * E2E Test: Checkout Flow for Existing Customer
 * Tests checkout with pre-filled customer information
 */
test.describe('Checkout - Existing Customer', () => {
  test.skip('should complete checkout with existing customer', async ({ page }) => {
    // SKIP: Requires live backend and Identity Server
    // This test would:
    // 1. Login first
    // 2. Verify customer info is prefilled
    // 3. Complete checkout with minimal input

    // Setup: Login and get authenticated state
    // (In real test, would use auth state setup)

    // 1. Navigate to catalog and add item
    await page.goto('/catalog');
    const firstItem = page.locator('[data-testid="item-card"]').first();
    await firstItem.click();
    await page.locator('button:has-text("Add to Cart")').click();

    // 2. Go to checkout
    await page.locator('[data-testid="cart-link"]').click();
    await page.locator('button:has-text("Proceed to Checkout")').click();

    // 3. Customer info should be prefilled
    const firstNameInput = page.locator('input[name="firstName"]');
    await expect(firstNameInput).toHaveValue(/.+/);

    // 4. Just update address if needed
    await page.locator('button:has-text("Continue")').click();

    // 5. Fill or update shipping address
    await page.fill('input[name="street"]', '456 Oak Ave');
    await page.fill('input[name="city"]', 'Chicago');
    await page.fill('input[name="state"]', 'IL');
    await page.fill('input[name="zipCode"]', '60601');
    await page.locator('button:has-text("Continue")').click();

    // 6. Review and submit
    await page.locator('button:has-text("Place Order")').click();

    // 7. Verify confirmation
    await expect(page).toHaveURL(/\/checkout\/confirmation/);
  });

  test('should allow editing prefilled customer info', async ({ page }) => {
    // Mock test without backend
    await page.goto('/checkout');

    // Simulate prefilled data (would come from localStorage in real scenario)
    await page.evaluate(() => {
      localStorage.setItem(
        'savedCheckoutInfo',
        JSON.stringify({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          birthDate: '1985-05-20',
        })
      );
    });

    await page.reload();

    // Verify prefilled
    await expect(page.locator('input[name="firstName"]')).toHaveValue('Jane');

    // Edit field
    await page.fill('input[name="firstName"]', 'Janet');
    await page.locator('button:has-text("Continue")').click();

    // Continue with flow...
  });
});
