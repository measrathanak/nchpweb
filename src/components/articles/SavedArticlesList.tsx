'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Locale } from '@/lib/i18n';

interface SavedArticleItem {
  id: string;
  typo3ArticleUid: number;
  title: string;
  language: string;
  savedAt: Date;
}

interface SavedArticlesListProps {
  locale: Locale;
  items: SavedArticleItem[];
}

export default function SavedArticlesList({ locale, items }: SavedArticlesListProps) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  const t = {
    en: {
      searchPlaceholder: 'Search saved articles...',
      noItems: 'You have not saved any articles yet.',
      noResults: 'No matching saved articles.',
      read: 'Read article',
      newest: 'Newest',
      oldest: 'Oldest',
      title: 'Title',
    },
    km: {
      searchPlaceholder: 'ស្វែងរកអត្ថបទដែលបានរក្សាទុក...',
      noItems: 'អ្នកមិនទាន់មានអត្ថបទដែលបានរក្សាទុកទេ។',
      noResults: 'មិនមានលទ្ធផលត្រូវគ្នាទេ។',
      read: 'អានអត្ថបទ',
      newest: 'ថ្មីបំផុត',
      oldest: 'ចាស់បំផុត',
      title: 'ចំណងជើង',
    },
  }[locale === 'km' ? 'km' : 'en'];

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const found = normalized
      ? items.filter((item) => item.title.toLowerCase().includes(normalized))
      : items;

    return [...found].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }

      const aTime = new Date(a.savedAt).getTime();
      const bTime = new Date(b.savedAt).getTime();
      return sortBy === 'newest' ? bTime - aTime : aTime - bTime;
    });
  }, [items, query, sortBy]);

  if (items.length === 0) {
    return <div className="rounded-lg border border-gray-200 p-6 text-gray-600">{t.noItems}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="newest">{t.newest}</option>
          <option value="oldest">{t.oldest}</option>
          <option value="title">{t.title}</option>
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-6 text-gray-600">{t.noResults}</div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <article key={item.id} className="rounded-lg border border-gray-200 p-5">
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <div className="text-sm text-gray-600 mb-3">
                {new Date(item.savedAt).toLocaleString(locale === 'km' ? 'km-KH' : 'en-US')}
              </div>
              <Link
                href={`/${locale}/article/${item.typo3ArticleUid}`}
                className="text-blue-600 hover:text-blue-800"
              >
                {t.read}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
