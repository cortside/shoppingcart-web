import { test, expect } from '@playwright/test';

/**
 * E2E Test: Profile Management
 * Tests viewing and editing user profile
 */
test.describe('Profile Management', () => {
  test.skip('should display and edit user profile', async ({ page }) => {
    // SKIP: Requires authentication and backend

    // 1. Login
    // await loginAsTestUser(page);

    // 2. Navigate to profile
    await page.goto('/account/profile');

    // 3. Verify profile page
    await expect(page.locator('h1')).toContainText('My Profile');

    // 4. Verify user information is displayed
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=john@example.com')).toBeVisible();

    // 5. Edit profile
    await page.locator('button:has-text("Edit")').click();

    // 6. Update fields
    await page.fill('input[name="firstName"]', 'Jonathan');
    await page.locator('button:has-text("Save")').click();

    // 7. Verify changes saved
    await expect(page.locator('text=Profile updated')).toBeVisible();
    await expect(page.locator('text=Jonathan')).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/account/profile');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
