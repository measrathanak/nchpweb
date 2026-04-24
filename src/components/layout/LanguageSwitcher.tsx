import React from 'react';
import { Locale, localeLabels } from '@/lib/i18n';
import Link from 'next/link';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  availableLocales: readonly Locale[];
  pathname: string;
}

export default function LanguageSwitcher({
  currentLocale,
  availableLocales,
  pathname,
}: LanguageSwitcherProps) {
  return (
    <div className="flex gap-2">
      {availableLocales.map((locale) => {
        const href = pathname.replace(`/${currentLocale}`, `/${locale}`);
        const isActive = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={href}
            className={`px-3 py-1 rounded ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {localeLabels[locale]}
          </Link>
        );
      })}
    </div>
  );
}
