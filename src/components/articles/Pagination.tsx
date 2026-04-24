import React from 'react';
import { Locale } from '@/lib/i18n';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  locale: Locale;
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  locale,
  baseUrl,
}: PaginationProps) {
  const translations = {
    en: {
      prev: 'Previous',
      next: 'Next',
    },
    km: {
      prev: 'ពីមុន',
      next: 'បន្ទាប់',
    },
  };

  const t = translations[locale] || translations.en;

  // Generate page numbers to display (max 7)
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 7;
    const halfWindow = Math.floor(maxPages / 2);

    let start = Math.max(1, currentPage - halfWindow);
    let end = Math.min(totalPages, currentPage + halfWindow);

    if (end - start < maxPages - 1) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxPages - 1);
      } else {
        start = Math.max(1, end - maxPages + 1);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {/* Previous Button */}
      {currentPage > 1 && (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          {t.prev}
        </Link>
      )}

      {/* Page Numbers */}
      {pageNumbers[0] > 1 && (
        <>
          <Link
            href={`${baseUrl}?page=1`}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            1
          </Link>
          {pageNumbers[0] > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pageNumbers.map((page) => (
        <Link
          key={page}
          href={`${baseUrl}?page=${page}`}
          className={`px-3 py-2 rounded transition ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </Link>
      ))}

      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="px-2">...</span>
          )}
          <Link
            href={`${baseUrl}?page=${totalPages}`}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next Button */}
      {currentPage < totalPages && (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          {t.next}
        </Link>
      )}
    </div>
  );
}
