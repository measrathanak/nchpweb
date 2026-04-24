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
  getArticles: vi.fn().mockResolvedValue({ articles: [], total: 0 }),
  searchArticles: vi.fn().mockResolvedValue({ results: [], total: 0 }),
}));

describe('articles page generateMetadata', () => {
  it('returns localized title for en', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });

    expect(typeof metadata.title === 'string' ? metadata.title : '').toContain('Articles');
  });

  it('returns localized title for km', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'km' }),
    });

    expect(typeof metadata.title === 'string' ? metadata.title : '').toContain('អត្ថបទ');
  });

  it('includes hreflang alternates for both locales', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });

    expect(metadata.alternates?.languages).toMatchObject({
      en: '/en/articles',
      km: '/km/articles',
    });
  });

  it('sets canonical to articles path for current locale', async () => {
    const enMeta = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });
    const kmMeta = await generateMetadata({ params: Promise.resolve({ locale: 'km' }) });

    expect(enMeta.alternates?.canonical).toBe('/en/articles');
    expect(kmMeta.alternates?.canonical).toBe('/km/articles');
  });

  it('sets og type to website', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });
    const og = metadata.openGraph as Record<string, unknown>;

    expect(og?.type).toBe('website');
  });

  it('sets twitter card to summary_large_image', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });
    expect(metadata.twitter?.card).toBe('summary_large_image');
  });
});
