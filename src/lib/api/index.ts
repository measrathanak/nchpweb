import axios, { AxiosInstance, AxiosError } from 'axios';
import { Article } from '@/types/content/article';

interface APIConfig {
  baseURL: string;
  username?: string;
  password?: string;
  useMockData?: boolean;
}

interface ArticlesListResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
}

// Mock data for development
const MOCK_ARTICLES: Article[] = [
  {
    uid: 1,
    title: 'Welcome to NPCH News',
    subtitle: 'Your source for Khmer and English news',
    bodytext: '<p>This is a sample article demonstrating the NPCH news platform in both English and Khmer.</p>',
    datetime: new Date().toISOString(),
    crdate: new Date().toISOString(),
    tstamp: new Date().toISOString(),
    author: 'Demo User',
    language: 0,
    categories: [],
    tags: ['news', 'welcome'],
    image: {
      uid: 1,
      name: 'welcome.jpg',
      title: 'Welcome Image',
      description: 'Welcome to NPCH',
      url: '/next.svg',
    },
  },
  {
    uid: 2,
    title: 'Sample Article 2',
    subtitle: 'Understanding our platform',
    bodytext: '<p>This is another sample article demonstrating the article display system.</p>',
    datetime: new Date(Date.now() - 86400000).toISOString(),
    crdate: new Date(Date.now() - 86400000).toISOString(),
    tstamp: new Date(Date.now() - 86400000).toISOString(),
    author: 'Sample Author',
    language: 0,
    categories: [],
    tags: ['sample', 'demo'],
  },
];

class TYPO3API {
  private client: AxiosInstance;
  private useMockData: boolean;
  private isConnected: boolean = false;

  constructor(config: APIConfig) {
    this.useMockData = config.useMockData ?? false;
    
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' },
    });

    if (config.username && config.password) {
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
      this.client.defaults.headers.common['Authorization'] = `Basic ${auth}`;
    }

    this.client.interceptors.response.use(
      response => response,
      error => {
        this.handleAPIError(error);
        throw error;
      }
    );
  }

  async checkConnection(): Promise<boolean> {
    if (this.useMockData) return true;
    
    try {
      await this.client.get('/health');
      this.isConnected = true;
      console.log('✓ TYPO3 API connected');
      return true;
    } catch {
      this.isConnected = false;
      console.warn('✗ TYPO3 API unavailable, using mock data');
      return false;
    }
  }

  async getArticles(page = 1, limit = 10, language = 'en'): Promise<ArticlesListResponse> {
    if (!this.isConnected && !this.useMockData) {
      await this.checkConnection();
    }

    if (this.useMockData || !this.isConnected) {
      const start = (page - 1) * limit;
      const articles = MOCK_ARTICLES.slice(start, start + limit);
      return { articles, total: MOCK_ARTICLES.length, page, limit };
    }

    try {
      const response = await this.client.get('/articles', {
        params: { page, limit, language },
      });
      const data = response.data;
      return {
        articles: data.articles || [],
        total: data.total || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching articles:', error);
      const start = (page - 1) * limit;
      const articles = MOCK_ARTICLES.slice(start, start + limit);
      return { articles, total: MOCK_ARTICLES.length, page, limit };
    }
  }

  async getArticle(uid: number, language = 'en'): Promise<Article | null> {
    if (!this.isConnected && !this.useMockData) {
      await this.checkConnection();
    }

    if (this.useMockData || !this.isConnected) {
      return MOCK_ARTICLES.find(a => a.uid === uid) || null;
    }

    try {
      const response = await this.client.get(`/articles/${uid}`, {
        params: { language },
      });
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching article ${uid}:`, error);
      return MOCK_ARTICLES.find(a => a.uid === uid) || null;
    }
  }

  async searchArticles(query: string, language = 'en', limit = 20) {
    if (!this.isConnected && !this.useMockData) {
      await this.checkConnection();
    }

    if (this.useMockData || !this.isConnected) {
      const results = MOCK_ARTICLES.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
      return { results, total: results.length };
    }

    try {
      const response = await this.client.get('/search', {
        params: { q: query, language, limit },
      });
      return response.data || { results: [], total: 0 };
    } catch (error) {
      console.error('Error searching:', error);
      const results = MOCK_ARTICLES.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
      return { results, total: results.length };
    }
  }

  async getNavigation(language = 'en') {
    if (!this.isConnected && !this.useMockData) {
      await this.checkConnection();
    }

    if (this.useMockData || !this.isConnected) {
      return { pages: [] };
    }

    try {
      const response = await this.client.get('/navigation', {
        params: { language },
      });
      return response.data || { pages: [] };
    } catch (error) {
      console.error('Error fetching navigation:', error);
      return { pages: [] };
    }
  }

  async getMedia(identifier: string) {
    if (!this.isConnected && !this.useMockData) {
      await this.checkConnection();
    }

    if (this.useMockData || !this.isConnected) {
      return null;
    }

    try {
      const response = await this.client.get(`/media/${identifier}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching media:`, error);
      return null;
    }
  }

  private handleAPIError(error: AxiosError) {
    if (error.response) {
      console.warn(`API Error: ${error.response.status}`);
    } else if (error.request) {
      console.warn('API Error: No response from server');
    } else {
      console.warn(`API Error: ${error.message}`);
    }
  }
}

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const apiURL = process.env.NEXT_PUBLIC_TYPO3_API_URL || 'http://localhost:8888/typo3rest';

const typo3API = new TYPO3API({
  baseURL: apiURL,
  username: process.env.TYPO3_API_USER,
  password: process.env.TYPO3_API_PASSWORD,
  useMockData,
});

if (typeof window === 'undefined') {
  typo3API.checkConnection().catch(() => {});
}

export default typo3API;
