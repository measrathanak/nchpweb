'use client';

import { usePathname } from 'next/navigation';
import { copy, toLocale } from '@/lib/i18n';

interface ArticleDetailErrorProps {
  error: Error;
  reset: () => void;
}

export default function ArticleDetailError({ error, reset }: ArticleDetailErrorProps) {
  const pathname = usePathname();
  const localeValue = toLocale(pathname.split('/')[1]);
  const t = copy[localeValue];

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <div className="rounded border border-red-300 bg-red-50 p-4">
        <h1 className="text-xl font-semibold text-red-800">{t.articleLoadErrorTitle}</h1>
        <p className="text-red-700 mt-2">{error.message || t.genericTryAgain}</p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="border rounded px-4 py-2 hover:bg-gray-50"
      >
        {t.retry}
      </button>
    </main>
  );
}
