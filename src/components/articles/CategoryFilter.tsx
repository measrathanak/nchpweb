'use client';

import React from 'react';
import { Locale } from '@/lib/i18n';
import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryFilterProps {
  locale: Locale;
  categories: Array<{ uid: number; title: string; slug: string }>;
  currentCategory?: string;
}

export default function CategoryFilter({
  locale,
  categories,
  currentCategory,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const translations = {
    en: {
      allCategories: 'All Categories',
    },
    km: {
      allCategories: 'ចំណាត់ថ្នាក់ទាំងអស់',
    },
  };

  const t = translations[locale] || translations.en;

  const handleCategoryChange = (slug: string | null) => {
    const params = new URLSearchParams(searchParams);
    
    if (slug) {
      params.set('category', slug);
      params.set('page', '1');
    } else {
      params.delete('category');
      params.delete('page');
    }

    const queryString = params.toString();
    router.push(
      `/${locale}/articles${queryString ? `?${queryString}` : ''}`
    );
  };

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <button
        onClick={() => handleCategoryChange(null)}
        className={`px-4 py-2 rounded-lg transition ${
          !currentCategory
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {t.allCategories}
      </button>

      {categories.map((category) => (
        <button
          key={category.uid}
          onClick={() => handleCategoryChange(category.slug)}
          className={`px-4 py-2 rounded-lg transition ${
            currentCategory === category.slug
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {category.title}
        </button>
      ))}
    </div>
  );
}
