import React from 'react';
import { Locale } from '@/lib/i18n';
import { Article } from '@/types/content/article';
import Image from 'next/image';
import Link from 'next/link';

interface ArticleListProps {
  articles: Article[];
  locale: Locale;
}

export default function ArticleList({ articles, locale }: ArticleListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{locale === 'km' ? 'រកមិនឃើញអត្ថបទ' : 'No articles found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <article
          key={article.uid}
          className="flex flex-col md:flex-row gap-6 border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
        >
          {/* Image */}
          {article.image && (
            <div className="md:w-48 flex-shrink-0">
              <Link href={`/${locale}/article/${article.uid}`}>
                <Image
                  src={article.image.url}
                  alt={article.image.title || article.title}
                  width={200}
                  height={150}
                  className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition"
                />
              </Link>
            </div>
          )}

          {/* Content */}
          <div className="flex-1">
            {/* Categories */}
            {article.categories && article.categories.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {article.categories.slice(0, 2).map((cat) => (
                  <span
                    key={cat.uid}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    {cat.title}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              <Link
                href={`/${locale}/article/${article.uid}`}
                className="text-gray-900 hover:text-blue-600 transition"
              >
                {article.title}
              </Link>
            </h2>

            {/* Subtitle */}
            {article.subtitle && (
              <p className="text-gray-600 mb-3">{article.subtitle}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <time dateTime={article.datetime}>
                {formatDate(article.datetime)}
              </time>
              {article.author && <span>• {article.author}</span>}
              <span>•</span>
            </div>

            {/* Excerpt */}
            <p className="text-gray-700 mb-4 line-clamp-3">
              {article.bodytext
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .substring(0, 200)}
              ...
            </p>

            {/* Read More Link */}
            <Link
              href={`/${locale}/article/${article.uid}`}
              className="inline-block text-blue-600 hover:text-blue-800 font-medium"
            >
              {locale === 'km' ? 'អានលម្អិត →' : 'Read More →'}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
