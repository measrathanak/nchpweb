import React from 'react';
import { Locale } from '@/lib/i18n';
import typo3API from '@/lib/api';
import ArticleList from '@/components/articles/ArticleList';
import NewsletterForm from '@/components/forms/NewsletterForm';
import Link from 'next/link';
import { Article } from '@/types/content/article';

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const revalidate = 3600;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const localeValue = locale as Locale;
  const localeCode = localeValue === 'km' ? 'km' : 'en';

  let featuredArticles: Article[] = [];

  try {
    const response = await typo3API.getArticles(1, 10, localeCode);
    featuredArticles = response.articles?.slice(0, 3) || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    featuredArticles = [];
  }

  const translations = {
    en: {
      featured: 'Featured Articles',
      viewMore: 'View All Articles',
      noArticles: 'No articles found',
      welcome: 'Welcome to NPCH',
      description: 'Stay informed with the latest news and policy updates',
      stayUpdated: 'Stay Updated',
      subscribe: 'Subscribe to get the latest news and policy updates delivered to your inbox.',
      email: 'Your email',
      subscribeBtn: 'Subscribe',
    },
    km: {
      featured: 'អត្ថបទលម្អិត',
      viewMore: 'មើលអត្ថបទទាំងអស់',
      noArticles: 'រកមិនឃើញអត្ថបទ',
      welcome: 'ស្វាគមន៍មកកាន់ NPCH',
      description: 'ស្វាគមន៍មកកាន់ព័ត៌មាន និងការធានាគោលនយោបាយ',
      stayUpdated: 'ស្វាគមន៍ដើម្បីគាំទ្របង',
      subscribe: 'ចូលរួមលក្ខណ៍នៅលើព័ត៌មាននិងការធានាគោលនយោបាយច្រើនបង្អាប់',
      email: 'អ៊ីមែលរបស់អ្នក',
      subscribeBtn: 'ចូលរូម',
    },
  };

  const t = translations[localeValue] || translations.en;

  return (
    <div className="space-y-12">
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.welcome}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t.description}
          </p>
          <Link
            href={`/${localeValue}/articles`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t.viewMore}
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8">{t.featured}</h2>
        {featuredArticles.length > 0 ? (
          <ArticleList articles={featuredArticles} locale={localeValue} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>{t.noArticles}</p>
          </div>
        )}
      </section>

      <section className="py-12 bg-gray-50 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">
          {t.stayUpdated}
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          {t.subscribe}
        </p>
        <NewsletterForm locale={localeValue} />
      </section>
    </div>
  );
}
