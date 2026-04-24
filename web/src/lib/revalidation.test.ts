import { afterEach, describe, expect, it } from 'vitest';
import {
  canonicalizeRevalidationPayload,
  createRevalidationSignature,
  getRevalidationPaths,
  isFreshRevalidationTimestamp,
  isValidRevalidationSecret,
  isValidRevalidationSignature,
} from './revalidation';

const originalSecret = process.env.REVALIDATE_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.REVALIDATE_SECRET;
    return;
  }

  process.env.REVALIDATE_SECRET = originalSecret;
});

describe('getRevalidationPaths', () => {
  it('returns all locale listing paths by default', () => {
    expect(getRevalidationPaths({})).toEqual([
      '/sitemap.xml',
      '/en',
      '/en/articles',
      '/en/articles/feed.xml',
      '/km',
      '/km/articles',
      '/km/articles/feed.xml',
    ]);
  });

  it('includes article detail paths for article-scoped revalidation', () => {
    expect(getRevalidationPaths({ scope: 'article', uid: 42, locales: ['km'] })).toEqual([
      '/sitemap.xml',
      '/km',
      '/km/articles',
      '/km/articles/feed.xml',
      '/km/article/42',
    ]);
  });
});

describe('isValidRevalidationSecret', () => {
  it('returns false when no secret is configured', () => {
    delete process.env.REVALIDATE_SECRET;

    expect(isValidRevalidationSecret('test')).toBe(false);
  });

  it('returns true only for an exact secret match', () => {
    process.env.REVALIDATE_SECRET = 'top-secret';

    expect(isValidRevalidationSecret('top-secret')).toBe(true);
    expect(isValidRevalidationSecret('wrong')).toBe(false);
  });
});

describe('revalidation request signing', () => {
  it('accepts a valid signature for a fresh timestamp', () => {
    const body = canonicalizeRevalidationPayload({ scope: 'all' });
    const timestamp = String(Date.now());
    const secret = 'top-secret';
    const signature = createRevalidationSignature(body, timestamp, secret);

    expect(isValidRevalidationSignature(body, timestamp, signature, secret)).toBe(true);
  });

  it('rejects stale timestamps', () => {
    const oldTimestamp = String(Date.now() - 301_000);

    expect(isFreshRevalidationTimestamp(oldTimestamp)).toBe(false);
  });

  it('rejects mismatched signatures', () => {
    const body = canonicalizeRevalidationPayload({ scope: 'all' });
    const timestamp = String(Date.now());

    expect(isValidRevalidationSignature(body, timestamp, 'wrong', 'top-secret')).toBe(false);
  });
});