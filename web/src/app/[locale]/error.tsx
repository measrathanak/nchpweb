'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { copy, toLocale } from '@/lib/i18n';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const pathname = usePathname() ?? '/en';
  const locale = toLocale(pathname.split('/')[1]);
  const t = copy[locale];

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center gap-4 p-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">500</p>
      <h1 className="text-3xl font-bold">{t.unexpectedErrorTitle}</h1>
      <p className="max-w-xl text-gray-600">{t.unexpectedErrorDescription}</p>
      {error.digest ? <p className="text-xs text-gray-500">{error.digest}</p> : null}
      <div className="flex gap-4">
        <button type="button" onClick={() => reset()} className="underline">
          {t.retry}
        </button>
        <Link href={`/${locale}`} className="underline">
          {t.backHome}
        </Link>
      </div>
    </main>
  );
}