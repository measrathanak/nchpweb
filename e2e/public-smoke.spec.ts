import { expect, test } from '@playwright/test';

test('articles page renders public article content', async ({ page }) => {
  await page.goto('/en/articles');

  await expect(page.getByRole('heading', { name: 'Articles' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Welcome to NPCH News' })).toBeVisible();
});

test('contact form submits successfully', async ({ page }) => {
  await page.goto('/en/contact');

  await page.getByPlaceholder('Name').fill('Playwright Test User');
  await page.getByPlaceholder('Email').fill('playwright@example.com');
  await page.getByPlaceholder('Phone').fill('012345678');
  await page.getByPlaceholder('Subject').fill('Browser smoke test');
  await page.getByPlaceholder('Message').fill('Contact form submission from Playwright smoke coverage.');
  await page.getByRole('button', { name: 'Send Message' }).click();

  await expect(page.getByText('Message sent successfully')).toBeVisible();
});