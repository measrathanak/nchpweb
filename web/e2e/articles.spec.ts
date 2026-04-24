import { test, expect } from '@playwright/test';

test.describe('/en/articles page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/articles');
  });

  test('has correct page title containing "Articles"', async ({ page }) => {
    await expect(page).toHaveTitle(/Articles/i);
  });

  test('html lang is "en"', async ({ page }) => {
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('en');
  });

  test('shows empty state or article list (graceful with no TYPO3)', async ({ page }) => {
    // Either articles are rendered or the empty-state message appears
    const hasArticles = await page.locator('article, [data-testid="article-item"]').count();
    const hasEmpty = await page.getByText(/No articles found/i).count();
    expect(hasArticles + hasEmpty).toBeGreaterThan(0);
  });

  test('search input is present', async ({ page }) => {
    const input = page.locator('input[type="search"], input[placeholder*="Search"]');
    await expect(input).toBeVisible();
  });

  test('has hreflang alternate for km', async ({ page }) => {
    const hreflang = await page.$('link[hreflang="km"]');
    expect(hreflang).not.toBeNull();
  });

  test('emits CollectionPage JSON-LD', async ({ page }) => {
    const scripts = await page.$$eval(
      'script[type="application/ld+json"]',
      (els) => els.map((el) => el.textContent ?? '')
    );
    const collection = scripts.find((s) => s.includes('"CollectionPage"'));
    expect(collection).toBeTruthy();
  });
});

test.describe('/km/articles page', () => {
  test('html lang is "km"', async ({ page }) => {
    await page.goto('/km/articles');
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('km');
  });
});
