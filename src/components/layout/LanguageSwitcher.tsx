'use client';

import React, { useState } from 'react';
import { Locale, localeLabels } from '@/lib/i18n';
import Link from 'next/link';
import { handleSignOut } from './SignOutAction';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  availableLocales: readonly Locale[];
  pathname: string;
  isAuthenticated?: boolean;
}

const languageFlags: Record<string, { flag: string; name: string }> = {
  km: { flag: '🇰🇭', name: 'ភាសាខ្មែរ' },
  en: { flag: '🇺🇸', name: 'English' },
  zh: { flag: '🇨🇳', name: '中文' },
  vi: { flag: '🇻🇳', name: 'Tiếng Việt' },
  fr: { flag: '🇫🇷', name: 'French' },
  ko: { flag: '🇰🇷', name: 'Korean' },
};

const allLanguages = [
  { code: 'km', ...languageFlags.km },
  { code: 'en', ...languageFlags.en },
  { code: 'zh', ...languageFlags.zh },
  { code: 'vi', ...languageFlags.vi },
  { code: 'fr', ...languageFlags.fr },
  { code: 'ko', ...languageFlags.ko },
];

export default function LanguageSwitcher({
  currentLocale,
  availableLocales,
  pathname,
  isAuthenticated = false,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = languageFlags[currentLocale];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        ☼
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {allLanguages.map((lang) => {
                const href = pathname.replace(`/${currentLocale}`, `/${lang.code}`);
                const isActive = lang.code === currentLocale;

                return (
                  <Link
                    key={lang.code}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-lg">{lang.name}</span>
                  </Link>
                );
              })}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  <form action={async () => await handleSignOut(currentLocale)}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="text-xl">🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
