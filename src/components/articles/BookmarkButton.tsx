import React from 'react';
import { Locale } from '@/lib/i18n';

interface BookmarkButtonProps {
  articleUid: number;
  title: string;
  slug: string;
  locale: Locale;
  isBookmarked?: boolean;
  onToggleBookmark?: (isBookmarked: boolean) => Promise<void>;
}

export default function BookmarkButton({
  locale,
  isBookmarked = false,
  onToggleBookmark,
}: BookmarkButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const translations = {
    en: {
      save: 'Save Article',
      saved: 'Article Saved',
      unsave: 'Remove',
    },
    km: {
      save: 'រក្សាទុកអត្ថបទ',
      saved: 'រក្សាទុកបានរួច',
      unsave: 'ដកចេញ',
    },
  };

  const t = translations[locale] || translations.en;

  const handleToggle = async () => {
    if (!onToggleBookmark) return;

    setLoading(true);
    try {
      await onToggleBookmark(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded font-medium transition ${
        isBookmarked
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="mr-2">
        {isBookmarked ? '★' : '☆'}
      </span>
      {isBookmarked ? t.saved : t.save}
    </button>
  );
}
