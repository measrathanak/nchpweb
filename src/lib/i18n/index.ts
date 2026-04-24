/**
 * i18n Configuration for Khmer/English Support
 */

export const defaultLocale = 'en' as const;
export const locales = ['en', 'km'] as const;

export type Locale = typeof locales[number];

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  km: 'ភាសាខ្មែរ',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  km: '🇰🇭',
};

/**
 * Get the text direction for a locale
 */
export function getDir(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'km' ? 'ltr' : 'ltr'; // Both LTR for now
}

/**
 * Translate locale code to TYPO3 language ID
 * TYPO3 uses: 0 = English, 1 = Khmer
 */
export function localeToTYPO3LanguageId(locale: Locale): number {
  const map: Record<Locale, number> = {
    en: 0,
    km: 1,
  };
  return map[locale] || 0;
}

/**
 * Translate TYPO3 language ID to locale
 */
export function typo3LanguageIdToLocale(languageId: number): Locale {
  const map: Record<number, Locale> = {
    0: 'en',
    1: 'km',
  };
  return map[languageId] || 'en';
}
