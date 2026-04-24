import React from 'react';
import { Locale } from '@/lib/i18n';

interface HeaderProps {
  locale: Locale;
  title?: string;
}

export default function Header({ locale, title = 'NPCH Website' }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">
              {locale === 'km' ? 'សូស្វាគមន៍' : 'Welcome'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
