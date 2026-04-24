import { test, expect } from '@playwright/test';

test.describe('locale redirect', () => {
  test('root / redirects to /en', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/en');
  });

  test('/en renders html lang="en"', async ({ page }) => {
    await page.goto('/en');
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('en');
  });

  test('/km renders html lang="km"', async ({ page }) => {
    await page.goto('/km');
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('km');
  });
});

test.describe('/en home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/NPCHWEB News Platform/i);
  });

  test('contains a link to /en/articles', async ({ page }) => {
    const link = page.locator('a[href="/en/articles"]').first();
    await expect(link).toBeVisible();
  });

  test('emits WebSite JSON-LD script', async ({ page }) => {
    const scripts = await page.$$eval(
      'script[type="application/ld+json"]',
      (els) => els.map((el) => el.textContent ?? '')
    );
    const webSite = scripts.find((s) => s.includes('"WebSite"'));
    expect(webSite).toBeTruthy();
  });

  test('emits hreflang alternate for km', async ({ page }) => {
    const hreflang = await page.$('link[hreflang="km"]');
    expect(hreflang).not.toBeNull();
  });
});

test.describe('/km home page', () => {
  test('has localized Khmer title', async ({ page }) => {
    await page.goto('/km');
    await expect(page).toHaveTitle(/វេទិកាព័ត៌មាន/);
  });
});
