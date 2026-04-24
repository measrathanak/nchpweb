/**
 * Type definitions for TYPO3 Article/News
 */

export interface Article {
  uid: number;
  title: string;
  subtitle?: string;
  bodytext: string;
  datetime: string;
  crdate: string;
  tstamp: string;
  author?: string;
  authorEmail?: string;
  image?: ArticleImage;
  categories?: Category[];
  tags?: string[];
  language: number;
  l10nParent?: number;
}

export interface ArticleImage {
  uid: number;
  name: string;
  title?: string;
  description?: string;
  url: string;
}

export interface Category {
  uid: number;
  title: string;
  slug: string;
}

export interface SearchResult {
  uid: number;
  title: string;
  excerpt: string;
  type: 'article' | 'page';
  url: string;
  score: number;
}

export interface NavigationItem {
  uid: number;
  title: string;
  slug: string;
  link?: string;
  children?: NavigationItem[];
  hidden: boolean;
}

export interface SEOMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}
