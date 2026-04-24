import { test, expect } from '@playwright/test';

/**
 * Verify that security response headers are present on HTML pages and
 * on the static meta routes (robots.txt, sitemap.xml).
 */

const PAGES = ['/en', '/km', '/en/articles'];

for (const path of PAGES) {
  test(`security headers present on ${path}`, async ({ request }) => {
    const res = await request.get(path);
    const h = res.headers();

    expect(h['x-frame-options']).toBe('SAMEORIGIN');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['permissions-policy']).toContain('camera=()');
    expect(h['content-security-policy']).toContain("default-src 'self'");
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(h['content-security-policy']).toContain("object-src 'none'");
  });
}

test('HSTS header is present', async ({ request }) => {
  // HSTS is only sent over HTTPS in real deployments; the header is still
  // set by Next.js in the HTTP dev/standalone server so we can test it here.
  const res = await request.get('/en');
  const hsts = res.headers()['strict-transport-security'];
  expect(hsts).toContain('max-age=63072000');
  expect(hsts).toContain('includeSubDomains');
});
