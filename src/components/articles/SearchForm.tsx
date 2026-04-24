'use client';

import React, { useState, useCallback } from 'react';
import { Locale } from '@/lib/i18n';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchFormProps {
  locale: Locale;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export default function SearchForm({
  locale,
  placeholder,
  onSearch,
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    en: {
      search: 'Search',
      placeholder: placeholder || 'Search articles...',
      searching: 'Searching...',
    },
    km: {
      search: 'ស្វាគមន៍',
      placeholder: placeholder || 'ស្វាគមន៍អត្ថបទ...',
      searching: 'ស្វាគមន៍...',
    },
  };

  const t = translations[locale] || translations.en;

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!query.trim()) {
        router.push(`/${locale}/articles`);
        return;
      }

      setIsLoading(true);
      
      try {
        // For now, navigate with search params
        // In Phase 3, we'll add an API endpoint
        const params = new URLSearchParams();
        params.set('q', query);
        params.set('page', '1');
        
        router.push(`/${locale}/articles?${params.toString()}`);
        
        if (onSearch) {
          onSearch(query);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [query, locale, router, onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    router.push(`/${locale}/articles`);
  }, [locale, router]);

  return (
    <form onSubmit={handleSearch} className="w-full mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? t.searching : t.search}
        </button>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}
