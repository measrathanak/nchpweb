import { NextRequest } from 'next/server';
import typo3API from '@/lib/api';
import { parsePositiveInt } from '@/app/api/_shared/validation';
import { ok, serverError } from '@/app/api/_shared/http';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const limit = parsePositiveInt(searchParams.get('limit'), 10);
    const language = searchParams.get('language') ?? 'en';

    const data = await typo3API.getArticles(page, limit, language);
    return ok(data);
  } catch (error) {
    console.error('Articles API error:', error);
    return serverError('Failed to fetch articles');
  }
}
