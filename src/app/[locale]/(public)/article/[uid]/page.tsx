import React from 'react';
import { Locale } from '@/lib/i18n';
import typo3API from '@/lib/api';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import Image from 'next/image';
import Link from 'next/link';
import ArticleBookmark from '@/components/articles/ArticleBookmark';
import { Category } from '@/types/content/article';

interface ArticlePageProps {
  params: Promise<{
    locale: string;
    uid: string;
  }>;
}

export const revalidate = 3600; // Revalidate every hour

async function getArticle(uid: string, locale: Locale) {
  const localeCode = locale === 'km' ? 'km' : 'en';
  try {
    return await typo3API.getArticle(parseInt(uid), localeCode);
  } catch (error) {
    console.error(`Error fetching article ${uid}:`, error);
    return null;
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, uid } = await params;
  const localeValue = locale as Locale;
  const article = await getArticle(uid, localeValue);
  const session = await auth();

  let isAuthenticated = false;
  let initialBookmarked = false;

  if (session?.user?.email && article) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (user) {
      isAuthenticated = true;
      const saved = await prisma.savedArticle.findUnique({
        where: {
          userId_typo3ArticleUid_language: {
            userId: user.id,
            typo3ArticleUid: article.uid,
            language: localeValue,
          },
        },
      });
      initialBookmarked = Boolean(saved);
    }
  }

  if (!article) {
    const translations = {
      en: {
        notFound: 'Article not found',
        backToArticles: 'Back to Articles',
      },
      km: {
        notFound: 'រកមិនឃើញអត្ថបទ',
        backToArticles: 'ត្រឡប់ទៅអត្ថបទ',
      },
    };

    const t = translations[localeValue] || translations.en;

    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t.notFound}</h1>
        <Link
          href={`/${localeValue}/articles`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← {t.backToArticles}
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(localeValue === 'km' ? 'km-KH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const translations = {
    en: {
      by: 'By',
      published: 'Published',
      backToArticles: 'Back to Articles',
      save: 'Save Article',
      saved: 'Saved',
      category: 'Category',
      tags: 'Tags',
    },
    km: {
      by: 'ដោយ',
      published: 'បានផ្សាយ',
      backToArticles: 'ត្រឡប់ទៅអត្ថបទ',
      save: 'រក្សាទុកអត្ថបទ',
      saved: 'រក្សាទុក',
      category: 'ចំណាត់ថ្នាក់',
      tags: 'ស្លាក',
    },
  };

  const t = translations[localeValue] || translations.en;

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${localeValue}/articles`}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← {t.backToArticles}
        </Link>

        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        
        {article.subtitle && (
          <p className="text-xl text-gray-600 mb-6">{article.subtitle}</p>
        )}

        <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
          <div>
            <span className="font-semibold">{t.published}:</span>{' '}
            {formatDate(article.datetime)}
          </div>
          {article.author && (
            <div>
              <span className="font-semibold">{t.by}:</span> {article.author}
            </div>
          )}
        </div>

        <ArticleBookmark
          locale={localeValue}
          articleUid={article.uid}
          title={article.title}
          initialBookmarked={initialBookmarked}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Featured Image */}
      {article.image && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <Image
            src={article.image.url}
            alt={article.image.title || article.title}
            width={800}
            height={400}
            className="w-full h-auto"
            priority
          />
          {article.image.description && (
            <p className="text-sm text-gray-500 mt-2">{article.image.description}</p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none mb-8">
        <div
          className="text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.bodytext }}
        />
      </div>

      {/* Categories */}
      {article.categories && article.categories.length > 0 && (
        <div className="mb-8 pt-8 border-t border-gray-200">
          <h3 className="font-semibold mb-3">{t.category}</h3>
          <div className="flex flex-wrap gap-2">
            {article.categories.map((cat: Category) => (
              <Link
                key={cat.uid}
                href={`/${localeValue}/articles?category=${cat.slug}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
              >
                {cat.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-3">{t.tags}</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles Section */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold mb-6">
          {localeValue === 'km' ? 'អត្ថបទដែលពាក់ព័ន្ធ' : 'Related Articles'}
        </h2>
        <p className="text-gray-600">
          {localeValue === 'km'
            ? 'ស្វាគមន៍ដើម្បីមើលលម្អិតលម្អិត'
            : 'More related articles coming soon'}
        </p>
      </div>
    </article>
  );
}
