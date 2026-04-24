import { locales } from "@/lib/i18n";

export function getSiteUrl() {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
}

export function absoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}

export function getLocaleAlternates(pathFn: (locale: string) => string): Record<string, string> {
  return Object.fromEntries(locales.map((locale) => [locale, pathFn(locale)]));
}

export function resolveOgImageUrl(url?: string): string {
  if (url && url.trim()) {
    return absoluteUrl(url);
  }
  return absoluteUrl("/og-default.svg");
}

export function toJsonLd(payload: Record<string, unknown>): string {
  return JSON.stringify(payload).replace(/</g, "\\u003c").replace(/&/g, "\\u0026");
}

export function getBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getOrganizationJsonLd(name: string) {
  const siteUrl = getSiteUrl().toString();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}#organization`,
    name,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/npch-logo.svg"),
    },
  };
}
