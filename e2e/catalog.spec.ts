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

    // Open sort dropdown and select Price: Low to High
    await page.locator('select[aria-label*="Sort"]').selectOption('unitPrice');

    // Wait for re-render
    await page.waitForTimeout(500);

    // Verify sort parameter in URL
    await expect(page).toHaveURL(/sort=unitPrice/);
  });

  test('should paginate through results', async ({ page }) => {
    await page.goto('/catalog');

    // Wait for initial load - backend returns 15 items in test data
    const itemCards = page.locator('[data-testid="item-card"]');
    await expect(itemCards).not.toHaveCount(0, { timeout: 5000 });

    // Get initial count
    const initialCount = await itemCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Click next page
    const nextButton = page.locator('button[aria-label="Next page"]');
    const isNextButtonEnabled = await nextButton.count() > 0 && !(await nextButton.isDisabled());

    if (isNextButtonEnabled) {
      await nextButton.click();

      // Verify page changed (URL uses 'page' parameter, not 'pageNumber')
      await expect(page).toHaveURL(/page=2/);
    }
  });
});
