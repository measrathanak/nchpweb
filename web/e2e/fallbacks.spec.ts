import { expect, test } from '@playwright/test';

test.describe('localized not-found pages', () => {
  test('/en missing route renders localized 404 UI', async ({ page }) => {
    const response = await page.goto('/en/does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/en');
    await expect(page.getByRole('link', { name: 'Browse all articles' })).toHaveAttribute('href', '/en/articles');
  });

  test('/km missing route renders Khmer 404 UI', async ({ page }) => {
    const response = await page.goto('/km/does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'រកមិនឃើញទំព័រ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ត្រឡប់ទៅទំព័រដើម' })).toHaveAttribute('href', '/km');
    await expect(page.getByRole('link', { name: 'មើលអត្ថបទទាំងអស់' })).toHaveAttribute('href', '/km/articles');
  });
});