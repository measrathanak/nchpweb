import { expect, test } from '@playwright/test';

test('protected saved page requires sign-in and loads for the demo user', async ({ page }) => {
  await page.goto('/en/saved');

  await expect(page).toHaveURL(/\/en\/auth\/signin/);
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

  await page.getByPlaceholder('Email').fill('demo@npch.local');
  await page.getByPlaceholder('Password').fill('demo1234');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/en$/);

  await page.goto('/en/saved');

  await expect(page.getByRole('heading', { name: 'Saved Articles' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sample Article 1' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Read article' })).toBeVisible();
});

test('sign out returns to home and shows sign in link', async ({ page }) => {
  // Sign in first
  await page.goto('/en/auth/signin');
  await page.getByPlaceholder('Email').fill('demo@npch.local');
  await page.getByPlaceholder('Password').fill('demo1234');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/\/en$/);

  // Full navigation to ensure server components re-render with session
  await page.goto('/en');
  await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();

  // Sign out via the auth menu button
  await page.getByRole('button', { name: 'Sign Out' }).click();

  // Should redirect back to home and show Sign In link (user is logged out)
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
});

test('regular user visiting dashboard is redirected to forbidden', async ({ page }) => {
  // Sign in as khmer user (regular user role, not editor/admin)
  await page.goto('/en/auth/signin');
  await page.getByPlaceholder('Email').fill('khmer@npch.local');
  await page.getByPlaceholder('Password').fill('khmer1234');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/en$/);

  // Attempt to access editor-only dashboard
  await page.goto('/en/dashboard');

  // Should be redirected to forbidden page
  await expect(page).toHaveURL(/\/en\/forbidden/);
  await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
});
