'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import BookmarkButton from '@/components/articles/BookmarkButton';
import { Locale } from '@/lib/i18n';

interface ArticleBookmarkProps {
  locale: Locale;
  articleUid: number;
  title: string;
  initialBookmarked: boolean;
  isAuthenticated: boolean;
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function ArticleBookmark({
  locale,
  articleUid,
  title,
  initialBookmarked,
  isAuthenticated,
}: ArticleBookmarkProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [toast, setToast] = useState<string | null>(null);
  const slug = useMemo(() => toSlug(title), [title]);

  const t = {
    en: {
      saved: 'Article saved',
      removed: 'Article removed',
      failed: 'Could not update bookmark',
      signIn: 'Sign in to save this article',
    },
    km: {
      saved: 'បានរក្សាទុកអត្ថបទ',
      removed: 'បានដកអត្ថបទចេញ',
      failed: 'មិនអាចធ្វើបច្ចុប្បន្នភាពការរក្សាទុក',
      signIn: 'ចូលប្រើប្រាស់ដើម្បីរក្សាទុកអត្ថបទ',
    },
  }[locale === 'km' ? 'km' : 'en'];

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-4">
        <Link
          href={`/${locale}/auth/signin`}
          className="text-blue-600 hover:text-blue-800"
        >
          {t.signIn}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <BookmarkButton
        articleUid={articleUid}
        title={title}
        slug={slug}
        locale={locale}
        isBookmarked={isBookmarked}
        onToggleBookmark={async (nextState) => {
          const previous = isBookmarked;
          setIsBookmarked(nextState);

          const method = nextState ? 'POST' : 'DELETE';
          const response = await fetch('/api/bookmarks', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleUid, title, slug, locale }),
          });

          if (!response.ok) {
            setIsBookmarked(previous);
            showToast(t.failed);
            throw new Error('Bookmark update failed');
          }

          showToast(nextState ? t.saved : t.removed);
        }}
      />
      {toast ? (
        <p className="text-sm text-gray-600" role="status" aria-live="polite">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
