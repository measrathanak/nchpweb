import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { removeSavedArticle, saveArticle } from '@/lib/db/utils';
import {
  badRequest,
  created,
  ok,
  serverError,
  unauthorized,
} from '@/app/api/_shared/http';
import { parseLocale, parsePositiveInt } from '@/app/api/_shared/validation';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  return user?.id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const articleUidParam = searchParams.get('articleUid');
    const language = parseLocale(searchParams.get('language'));

    if (articleUidParam) {
      const articleUid = parsePositiveInt(articleUidParam, 0);
      if (articleUid <= 0) {
        return badRequest('Invalid articleUid');
      }

      const saved = await prisma.savedArticle.findUnique({
        where: {
          userId_typo3ArticleUid_language: {
            userId,
            typo3ArticleUid: articleUid,
            language,
          },
        },
      });

      return ok({ isBookmarked: Boolean(saved) });
    }

    const savedArticles = await prisma.savedArticle.findMany({
      where: { userId, language },
      orderBy: { savedAt: 'desc' },
    });

    return ok({ items: savedArticles });
  } catch (error) {
    console.error('Bookmarks GET error:', error);
    return serverError('Failed to fetch bookmarks');
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return unauthorized();
    }

    const body = await request.json();
    const { articleUid, title, slug, locale } = body as {
      articleUid?: number;
      title?: string;
      slug?: string;
      locale?: string;
    };

    if (!articleUid || !title) {
      return badRequest('Invalid payload');
    }

    const language = parseLocale(locale);

    const saved = await saveArticle(userId, {
      typo3ArticleUid: articleUid,
      title,
      slug: slug || slugify(title),
      language,
    });

    return created({ id: saved.id, saved: true });
  } catch (error) {
    console.error('Bookmarks POST error:', error);
    return serverError('Failed to save bookmark');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return unauthorized();
    }

    const body = await request.json();
    const { articleUid, locale } = body as {
      articleUid?: number;
      locale?: string;
    };

    if (!articleUid) {
      return badRequest('Invalid payload');
    }

    const language = parseLocale(locale);
    await removeSavedArticle(userId, articleUid, language);

    return ok({ removed: true });
  } catch (error) {
    console.error('Bookmarks DELETE error:', error);
    return serverError('Failed to remove bookmark');
  }
}
