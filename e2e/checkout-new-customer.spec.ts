import { test, expect } from '@playwright/test';

/**
 * E2E Test: Checkout Flow for New Customer
 * Tests the complete checkout process from cart to order confirmation
 *
 * Note: This test requires Identity Server to be running on localhost:5002
 * and configured to work with the test credentials.
 */
test.describe('Checkout - New Customer', () => {
  test.skip('should complete full checkout flow for new customer', async ({ page }) => {
    // SKIP: This test requires a live backend and Identity Server
    // In a real environment, you would:
    // 1. Set up test user credentials
    // 2. Configure Identity Server for test environment
    // 3. Set up test data in backend APIs

    // 1. Add items to cart
    await page.goto('/catalog');
    const firstItem = page.locator('[data-testid="item-card"]').first();
    await firstItem.click();
    await page.locator('button:has-text("Add to Cart")').click();

    // 2. Navigate to cart
    await page.locator('[data-testid="cart-link"]').click();
    await expect(page).toHaveURL('/cart');

    // 3. Proceed to checkout (should redirect to login)
    await page.locator('button:has-text("Proceed to Checkout")').click();
    await expect(page).toHaveURL(/\/login/);

    // 4. Login through Identity Server
    // Note: This would redirect to Identity Server login page
    await page.waitForURL(/localhost:5002/);
    await page.fill('input[name="username"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.locator('button[type="submit"]').click();

    // 5. After login, should redirect to checkout
    await expect(page).toHaveURL('/checkout');

    // 6. Fill customer information
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="birthDate"]', '1990-01-15');
    await page.locator('button:has-text("Continue")').click();

    // 7. Fill shipping address
    await page.fill('input[name="street"]', '123 Main St');
    await page.fill('input[name="city"]', 'Springfield');
    await page.fill('input[name="state"]', 'IL');
    await page.fill('input[name="zipCode"]', '62701');
    await page.locator('button:has-text("Continue")').click();

    // 8. Review order
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=123 Main St')).toBeVisible();

    // 9. Submit order
    await page.locator('button:has-text("Place Order")').click();

    // 10. Verify confirmation
    await expect(page).toHaveURL(/\/checkout\/confirmation/);
    await expect(page.locator('text=Order placed successfully')).toBeVisible();
  });

  test('should validate required fields in customer info form', async ({ page }) => {
    // This test doesn't require backend, just form validation
    await page.goto('/checkout');

    // Try to continue without filling required fields
    await page.locator('button:has-text("Continue")').click();

    // Verify error messages appear
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Birth date is required')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/checkout');

    // Fill invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.locator('button:has-text("Continue")').click();

    // Verify error message
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should validate birthdate format', async ({ page }) => {
    await page.goto('/checkout');

    // Fill invalid date
    await page.fill('input[name="birthDate"]', '01/15/1990');
    await page.locator('button:has-text("Continue")').click();

    // Verify error message
    await expect(page.locator('text=Invalid date')).toBeVisible();
  });
});
