'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { copy, toLocale } from '@/lib/i18n';

export default function NotFound() {
  const pathname = usePathname() ?? '/en';
  const locale = toLocale(pathname.split('/')[1]);
  const t = copy[locale];

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center gap-4 p-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">404</p>
      <h1 className="text-3xl font-bold">{t.pageNotFoundTitle}</h1>
      <p className="max-w-xl text-gray-600">{t.pageNotFoundDescription}</p>
      <div className="flex gap-4">
        <Link href={`/${locale}`} className="underline">
          {t.backHome}
        </Link>
        <Link href={`/${locale}/articles`} className="underline">
          {t.browseAll}
        </Link>
      </div>
    </main>
  );
}