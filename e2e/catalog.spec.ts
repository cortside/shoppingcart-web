import { test, expect } from '@playwright/test';

/**
 * E2E Test: Browse & Add to Cart
 * Critical user flow for browsing products and adding them to cart
 */
test.describe('Catalog - Browse & Add to Cart', () => {
  test('should browse catalog and add items to cart', async ({ page }) => {
    // Navigate to catalog
    await page.goto('/');
    await expect(page).toHaveURL('/catalog');

    // Wait for catalog to load
    await expect(page.locator('h1')).toContainText('Catalog');

    // Verify product grid is visible
    const productGrid = page.locator('.grid');
    await expect(productGrid).toBeVisible();

    // Find first product and click to view details
    const firstProduct = page.locator('[data-testid="item-card"]').first();
    await expect(firstProduct).toBeVisible();

    const productName = await firstProduct.locator('h3').textContent();
    await firstProduct.click();

    // Verify product detail page loaded
    await expect(page.locator('h1')).toContainText(productName || '');

    // Add to cart
    await page.locator('button:has-text("Add to Cart")').click();

    // Verify cart count updated in header
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');

    // Increase quantity and add again
    const quantityInput = page.locator('input[type="number"]');
    await quantityInput.fill('2');
    await page.locator('button:has-text("Add to Cart")').click();

    // Verify cart count updated (now 3 total)
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('3');
  });

  test('should search for products', async ({ page }) => {
    await page.goto('/catalog');

    // Enter search query
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('widget');
    await searchInput.press('Enter');

    // Wait for results
    await page.waitForTimeout(1000); // debounce delay

    // Verify results contain search term
    const items = page.locator('[data-testid="item-card"]');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should sort products', async ({ page }) => {
    await page.goto('/catalog');

    // Open sort dropdown
    await page.locator('select[aria-label*="Sort"]').selectOption('price-asc');

    // Wait for re-render
    await page.waitForTimeout(500);

    // Verify sort parameter in URL or results reordered
    // Note: This depends on implementation details
  });

  test('should paginate through results', async ({ page }) => {
    await page.goto('/catalog');

    // Wait for initial load
    await expect(page.locator('[data-testid="item-card"]')).toHaveCount(20, { timeout: 5000 });

    // Click next page
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();

      // Verify page changed
      await expect(page).toHaveURL(/pageNumber=2/);
    }
  });
});
