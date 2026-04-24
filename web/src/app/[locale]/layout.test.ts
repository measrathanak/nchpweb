import { describe, expect, it, vi } from 'vitest';
import { generateMetadata } from './layout';

// next/font/google is a Next.js bundler transform; stub it for Vitest
vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans', className: 'geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono', className: 'geist-mono' }),
}));

vi.mock('@/lib/seo', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/seo')>();
  return {
    ...actual,
    getSiteUrl: () => new URL('http://localhost:3000'),
  };
});

describe('locale layout generateMetadata', () => {
  it('returns localized title and description for en', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });

    expect(metadata.title).toBe('NPCHWEB News Platform');
    expect(metadata.description).toContain('NPCH');
  });

  it('returns localized title and description for km', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'km' }),
    });

    expect(metadata.title).toBe('វេទិកាព័ត៌មាន NPCHWEB');
    expect(metadata.description).toBeTruthy();
  });

  it('includes hreflang alternates for both locales', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });

    expect(metadata.alternates?.languages).toMatchObject({
      en: '/en',
      km: '/km',
    });
  });

  it('sets canonical to locale-prefixed path', async () => {
    const enMeta = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });
    const kmMeta = await generateMetadata({ params: Promise.resolve({ locale: 'km' }) });

    expect(enMeta.alternates?.canonical).toBe('/en');
    expect(kmMeta.alternates?.canonical).toBe('/km');
  });

  it('sets correct og locale for each language', async () => {
    const enMeta = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });
    const kmMeta = await generateMetadata({ params: Promise.resolve({ locale: 'km' }) });

    const enOg = enMeta.openGraph as Record<string, unknown>;
    const kmOg = kmMeta.openGraph as Record<string, unknown>;
    expect(enOg?.locale).toBe('en_US');
    expect(kmOg?.locale).toBe('km_KH');
  });

  it('sets twitter card to summary_large_image', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });
    expect(metadata.twitter?.card).toBe('summary_large_image');
  });
});
