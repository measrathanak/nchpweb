import { describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  getBreadcrumbJsonLd,
  getLocaleAlternates,
  getOrganizationJsonLd,
  resolveOgImageUrl,
  toJsonLd,
} from './seo';

describe('seo helpers', () => {
  it('creates locale alternates for all configured locales', () => {
    const alternates = getLocaleAlternates((locale) => `/${locale}/articles`);

    expect(alternates).toEqual({
      en: '/en/articles',
      km: '/km/articles',
    });
  });

  it('builds breadcrumb json-ld with ordered list items', () => {
    const breadcrumb = getBreadcrumbJsonLd([
      { name: 'Home', url: absoluteUrl('/en') },
      { name: 'Articles', url: absoluteUrl('/en/articles') },
    ]);

    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);
    expect(breadcrumb.itemListElement[0]).toMatchObject({
      position: 1,
      name: 'Home',
    });
    expect(breadcrumb.itemListElement[1]).toMatchObject({
      position: 2,
      name: 'Articles',
    });
  });

  it('escapes unsafe characters in json-ld payloads', () => {
    const payload = { html: '<script>alert(1)</script>' };
    const serialized = toJsonLd(payload);

    expect(serialized).toContain('\\u003cscript>');
    expect(() => JSON.parse(serialized)).not.toThrow();
  });

  it('returns organization json-ld with stable identity and logo', () => {
    const organization = getOrganizationJsonLd('NPCHWEB News Platform');

    expect(organization['@type']).toBe('Organization');
    expect(organization['@id']).toContain('#organization');
    expect(organization.logo).toMatchObject({
      '@type': 'ImageObject',
    });
  });

  it('resolves relative and fallback social images', () => {
    const fallback = resolveOgImageUrl();
    const relative = resolveOgImageUrl('/uploads/image.jpg');

    expect(fallback).toContain('/og-default.svg');
    expect(relative).toContain('/uploads/image.jpg');
  });
});
