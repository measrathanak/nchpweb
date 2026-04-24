import React, { Suspense } from 'react';
import { Locale } from '@/lib/i18n';
import typo3API from '@/lib/api';
import ArticleList from '@/components/articles/ArticleList';
import Pagination from '@/components/articles/Pagination';
import SearchForm from '@/components/articles/SearchForm';
import CategoryFilter from '@/components/articles/CategoryFilter';
import { Article, Category } from '@/types/content/article';

interface ArticlesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    category?: string;
    q?: string;
  }>;
}

export const revalidate = 3600;

async function ArticlesContent({ 
  locale, 
  page, 
  category,
  searchQuery,
}: {
  locale: Locale;
  page: number;
  category?: string;
  searchQuery?: string;
}) {
  const localeCode = locale === 'km' ? 'km' : 'en';
  const itemsPerPage = 10;

  let articles: Article[] = [];
  let totalCount = 0;

  try {
    if (searchQuery) {
      const searchResponse = await typo3API.searchArticles(
        searchQuery,
        localeCode,
        100
      );
      articles = (searchResponse.results || []).slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
      );
      totalCount = searchResponse.total || 0;
    } else {
      const response = await typo3API.getArticles(page, itemsPerPage, localeCode);
      articles = response.articles || [];
      totalCount = response.total || articles.length;
      
      if (category) {
        articles = articles.filter((article: Article) =>
          article.categories?.some((cat: Category) => cat.slug === category)
        );
      }
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const translations = {
    en: {
      articles: 'Articles',
      page: 'Page',
      noArticles: 'No articles found',
      category: 'Category',
      allCategories: 'All Categories',
    },
    km: {
      articles: 'អត្ថបទ',
      page: 'ទំព័រ',
      noArticles: 'រកមិនឃើញអត្ថបទ',
      category: 'ចំណាត់ថ្នាក់',
      allCategories: 'ចំណាត់ថ្នាក់ទាំងអស់',
    },
  };

  const t = translations[locale] || translations.en;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">{t.articles}</h1>
        <p className="text-gray-600">
          {t.page} {page} {locale === 'km' ? 'នៃ' : 'of'} {totalPages}
        </p>
      </div>

      <SearchForm locale={locale} />

      <CategoryFilter
        locale={locale}
        categories={[
          { uid: 1, title: 'News', slug: 'news' },
          { uid: 2, title: 'Policy', slug: 'policy' },
          { uid: 3, title: 'Updates', slug: 'updates' },
        ]}
        currentCategory={category}
      />

      {articles.length > 0 ? (
        <>
          <ArticleList articles={articles} locale={locale} />
          
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              locale={locale}
              baseUrl={`/${locale}/articles${category ? `?category=${category}` : ''}`}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>{t.noArticles}</p>
        </div>
      )}
    </div>
  );
}

export default async function ArticlesPage({
  params,
  searchParams,
}: ArticlesPageProps) {
  const { locale } = await params;
  const { page: pageStr, category, q } = await searchParams;
  const localeValue = locale as Locale;
  const page = parseInt(pageStr || '1', 10);

  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <ArticlesContent 
        locale={localeValue} 
        page={page} 
        category={category}
        searchQuery={q}
      />
    </Suspense>
  );
}
