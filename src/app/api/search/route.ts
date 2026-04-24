import { NextRequest } from 'next/server';
import typo3API from '@/lib/api';
import { parsePositiveInt } from '@/app/api/_shared/validation';
import { ok, serverError } from '@/app/api/_shared/http';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') ?? '').trim();
    const language = searchParams.get('language') ?? 'en';
    const limit = parsePositiveInt(searchParams.get('limit'), 20);

    if (!q) {
      return ok({ results: [], total: 0 });
    }

    const data = await typo3API.searchArticles(q, language, limit);
    return ok(data);
  } catch (error) {
    console.error('Search API error:', error);
    return serverError('Search failed');
  }
}
