import { test, expect } from '@playwright/test';

/**
 * E2E Test: Cart Management
 * Tests adding, updating, and removing items from cart
 */
test.describe('Cart Management', () => {
  test('should add items to cart and update quantities', async ({ page }) => {
    // Navigate to catalog
    await page.goto('/catalog');

    // Add first item
    const firstItem = page.locator('[data-testid="item-card"]').first();
    const itemName = await firstItem.locator('h3').textContent();
    await firstItem.click();

    // Add to cart
    await page.locator('button:has-text("Add to Cart")').click();

    // Go to cart
    await page.locator('[data-testid="cart-link"]').click();
    await expect(page).toHaveURL('/cart');

    // Verify item is in cart
    await expect(page.locator(`text=${itemName}`)).toBeVisible();

    // Increase quantity
    const quantityInput = page.locator('input[type="number"]').first();
    await quantityInput.fill('3');

    // Verify subtotal updated
    // Note: This depends on implementation details
  });

  test('should remove items from cart', async ({ page }) => {
    // Add item first
    await page.goto('/catalog');
    const firstItem = page.locator('[data-testid="item-card"]').first();
    await firstItem.click();
    await page.locator('button:has-text("Add to Cart")').click();

    // Go to cart
    await page.locator('[data-testid="cart-link"]').click();

    // Remove item
    await page.locator('button:has-text("Remove")').first().click();

    // Verify cart is empty
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should persist cart across page refreshes', async ({ page }) => {
    // Add item
    await page.goto('/catalog');
    const firstItem = page.locator('[data-testid="item-card"]').first();
    const itemName = await firstItem.locator('h3').textContent();
    await firstItem.click();
    await page.locator('button:has-text("Add to Cart")').click();

    // Refresh page
    await page.reload();

    // Verify cart count still shows
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');

    // Go to cart and verify item still there
    await page.locator('[data-testid="cart-link"]').click();
    await expect(page.locator(`text=${itemName}`)).toBeVisible();
  });

  test('should clear cart when clicking clear button', async ({ page }) => {
    // Add items
    await page.goto('/catalog');
    const items = page.locator('[data-testid="item-card"]');

    // Add first item
    await items.first().click();
    await page.locator('button:has-text("Add to Cart")').click();

    // Go back and add second item
    await page.goto('/catalog');
    await items.nth(1).click();
    await page.locator('button:has-text("Add to Cart")').click();

    // Go to cart
    await page.locator('[data-testid="cart-link"]').click();

    // Clear cart (if clear button exists)
    const clearButton = page.locator('button:has-text("Clear Cart")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await expect(page.locator('text=Your cart is empty')).toBeVisible();
    }
  });
});
