import { describe, expect, it, vi } from 'vitest';
import { generateMetadata } from './page';

vi.mock('@/lib/seo', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/seo')>();
  return {
    ...actual,
    getSiteUrl: () => new URL('http://localhost:3000'),
  };
});

vi.mock('@/lib/typo3-client', () => ({
  getArticle: vi.fn().mockResolvedValue({
    uid: 42,
    title: 'Test Article',
    subtitle: 'A test subtitle',
    datetime: '2026-04-24T10:00:00Z',
  }),
}));

describe('article detail generateMetadata', () => {
  it('returns article title in en metadata', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'en', uid: '42' }),
    });

    expect(typeof metadata.title === 'string' ? metadata.title : '').toContain('Test Article');
  });

  it('returns article subtitle as og description', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'en', uid: '42' }),
    });

    const og = metadata.openGraph as Record<string, unknown>;
    expect(og?.description).toBe('A test subtitle');
  });

  it('includes hreflang alternates for both locales', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'en', uid: '42' }),
    });

    expect(metadata.alternates?.languages).toMatchObject({
      en: '/en/article/42',
      km: '/km/article/42',
    });
  });

  it('sets canonical to article path for current locale', async () => {
    const enMeta = await generateMetadata({ params: Promise.resolve({ locale: 'en', uid: '42' }) });
    const kmMeta = await generateMetadata({ params: Promise.resolve({ locale: 'km', uid: '42' }) });

    expect(enMeta.alternates?.canonical).toBe('/en/article/42');
    expect(kmMeta.alternates?.canonical).toBe('/km/article/42');
  });

  it('sets og type to article', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en', uid: '42' }) });
    const og = metadata.openGraph as Record<string, unknown>;

    expect(og?.type).toBe('article');
  });

  it('sets og images to resolved url', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en', uid: '42' }) });
    const og = metadata.openGraph as Record<string, unknown>;
    const images = og?.images as Array<{ url: string }>;

    expect(images?.[0]?.url).toContain('/og-default.svg');
  });

  it('returns not-found metadata for invalid uid', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'en', uid: 'invalid' }),
    });

    expect(typeof metadata.title === 'string' ? metadata.title : '').toContain('Article not found');
  });

  it('returns not-found metadata for negative uid', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'en', uid: '-1' }),
    });

    expect(typeof metadata.title === 'string' ? metadata.title : '').toContain('Article not found');
  });
});
