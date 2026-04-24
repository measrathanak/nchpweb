/**
 * Custom hook for fetching articles from TYPO3
 */

import { useEffect, useState } from 'react';
import typo3API from '@/lib/api';
import { Article } from '@/types/content/article';
import { Locale } from '@/lib/i18n';

interface UseArticlesResult {
  articles: Article[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
}

export function useArticles(
  page: number = 1,
  limit: number = 10,
  locale: Locale = 'en'
): UseArticlesResult {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchArticles = async () => {
      try {
        setLoading(true);
        const localeCode = locale === 'km' ? 'km' : 'en';
        const response = await typo3API.getArticles(page, limit, localeCode);
        
        if (isMounted) {
          const articlesData = Array.isArray(response)
            ? response
            : response.articles || [];
          setArticles(articlesData);
          setTotalCount(response.total || articlesData.length);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch articles'));
          setArticles([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, [page, limit, locale]);

  return { articles, loading, error, totalCount };
}

/**
 * Custom hook for fetching a single article
 */

interface UseArticleResult {
  article: Article | null;
  loading: boolean;
  error: Error | null;
}

export function useArticle(uid: number, locale: Locale = 'en'): UseArticleResult {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        const localeCode = locale === 'km' ? 'km' : 'en';
        const data = await typo3API.getArticle(uid, localeCode);
        
        if (isMounted) {
          setArticle(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch article'));
          setArticle(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [uid, locale]);

  return { article, loading, error };
}

/**
 * Custom hook for searching articles
 */

interface UseSearchResult {
  results: Article[];
  loading: boolean;
  error: Error | null;
}

export function useSearch(
  query: string,
  locale: Locale = 'en'
): UseSearchResult {
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!query.trim()) {
      const resetTimer = setTimeout(() => {
        if (isMounted) {
          setResults([]);
          setError(null);
          setLoading(false);
        }
      }, 0);

      return () => {
        isMounted = false;
        clearTimeout(resetTimer);
      };
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        const localeCode = locale === 'km' ? 'km' : 'en';
        const data = await typo3API.searchArticles(query, localeCode);

        if (isMounted) {
          const normalizedResults = Array.isArray(data)
            ? data
            : data.results || [];

          setResults(normalizedResults as Article[]);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Search failed'));
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Debounce search
    const timer = setTimeout(performSearch, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [query, locale]);

  return { results, loading, error };
}
