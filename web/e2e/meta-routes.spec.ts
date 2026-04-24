import { test, expect } from '@playwright/test';

test.describe('robots.txt', () => {
  test('is served with correct content-type', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBe(true);
    expect(res.headers()['content-type']).toContain('text/plain');
  });

  test('disallows /api/', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('Disallow: /api/');
  });

  test('points to sitemap.xml', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('sitemap.xml');
  });
});

test.describe('sitemap.xml', () => {
  test('is served as XML', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBe(true);
    expect(res.headers()['content-type']).toContain('xml');
  });

  test('contains /en and /km locale URLs', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text();
    expect(body).toContain('/en');
    expect(body).toContain('/km');
  });
});

test.describe('RSS feed', () => {
  test('/en/articles/feed.xml is served as RSS', async ({ request }) => {
    const res = await request.get('/en/articles/feed.xml');
    expect(res.ok()).toBe(true);
    expect(res.headers()['content-type']).toContain('rss+xml');
  });

  test('/km/articles/feed.xml is served as RSS', async ({ request }) => {
    const res = await request.get('/km/articles/feed.xml');
    expect(res.ok()).toBe(true);
    expect(res.headers()['content-type']).toContain('rss+xml');
  });

  test('en feed contains valid RSS 2.0 root element', async ({ request }) => {
    const body = await (await request.get('/en/articles/feed.xml')).text();
    expect(body).toContain('<rss version="2.0"');
    expect(body).toContain('<channel>');
    expect(body).toContain('</channel>');
  });

  test('en feed atom:link points to itself', async ({ request }) => {
    const body = await (await request.get('/en/articles/feed.xml')).text();
    expect(body).toContain('/en/articles/feed.xml');
  });
});
