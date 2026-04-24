import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getArticlesMock = vi.fn();

vi.mock('@/lib/api', () => ({
  default: {
    getArticles: getArticlesMock,
  },
}));

describe('GET /api/articles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns article data with parsed query params', async () => {
    getArticlesMock.mockResolvedValue({
      articles: [{ uid: 1, title: 'Demo article' }],
      total: 1,
      page: 2,
      limit: 5,
    });

    const { GET } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/articles?page=2&limit=5&language=km');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getArticlesMock).toHaveBeenCalledWith(2, 5, 'km');
    expect(body).toEqual({
      articles: [{ uid: 1, title: 'Demo article' }],
      total: 1,
      page: 2,
      limit: 5,
    });
  });

  it('returns a server error when article lookup fails', async () => {
    getArticlesMock.mockRejectedValue(new Error('boom'));

    const { GET } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/articles');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to fetch articles' });
  });
});