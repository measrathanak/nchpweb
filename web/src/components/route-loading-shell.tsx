'use client';

import { copy, toLocale } from '@/lib/i18n';
import { usePathname } from 'next/navigation';

interface RouteLoadingShellProps {
  variant: 'home' | 'articles' | 'article';
}

export function RouteLoadingShell({ variant }: RouteLoadingShellProps) {
  const pathname = usePathname() ?? '/en';
  const locale = toLocale(pathname.split('/')[1]);
  const t = copy[locale];

  if (variant === 'home') {
    return (
      <main className="mx-auto max-w-4xl space-y-6 p-6" aria-busy="true">
        <header className="space-y-3">
          <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-gray-100" />
          <div className="flex gap-3 text-sm text-gray-500">
            <span>{t.loadingArticles}</span>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">{t.latest}</h2>
          <ul className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className="space-y-3 rounded border p-3">
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
              </li>
            ))}
          </ul>
        </section>
      </main>
    );
  }

  if (variant === 'articles') {
    return (
      <main className="mx-auto max-w-4xl space-y-6 p-6" aria-busy="true">
        <header className="space-y-3">
          <div className="h-10 w-56 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
          <div className="flex flex-wrap gap-2">
            <div className="h-10 min-w-[240px] animate-pulse rounded border bg-gray-50" />
            <div className="h-10 w-36 animate-pulse rounded border bg-gray-50" />
            <div className="h-10 w-32 animate-pulse rounded border bg-gray-50" />
            <div className="h-10 w-28 animate-pulse rounded border bg-gray-50" />
          </div>
          <p className="text-sm text-gray-500">{t.loadingArticles}</p>
        </header>

        <ul className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="space-y-3 rounded border p-4">
              <div className="h-6 w-3/5 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6" aria-busy="true">
      <header className="space-y-3">
        <div className="h-10 w-4/5 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-3/5 animate-pulse rounded bg-gray-100" />
        <p className="text-sm text-gray-500">{t.loadingArticle}</p>
      </header>

      <section className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-4 w-full animate-pulse rounded bg-gray-100" />
        ))}
      </section>

      <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
    </main>
  );
}