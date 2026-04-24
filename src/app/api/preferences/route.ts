import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { badRequest, ok, serverError, unauthorized } from '@/app/api/_shared/http';

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const prefs = await prisma.userPreferences.findUnique({
      where: { userId },
      select: {
        notificationsEnabled: true,
        theme: true,
        fontSize: true,
        articlesPerPage: true,
      },
    });

    // Return defaults if no record yet
    return ok(
      prefs ?? {
        notificationsEnabled: true,
        theme: 'light',
        fontSize: 'medium',
        articlesPerPage: 10,
      },
    );
  } catch (error) {
    console.error('Preferences GET error:', error);
    return serverError('Failed to fetch preferences');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const body = await request.json();

    const allowed: Record<string, unknown> = {};

    if (typeof body.notificationsEnabled === 'boolean') {
      allowed.notificationsEnabled = body.notificationsEnabled;
    }
    if (typeof body.theme === 'string' && ['light', 'dark'].includes(body.theme)) {
      allowed.theme = body.theme;
    }
    if (typeof body.fontSize === 'string' && ['small', 'medium', 'large'].includes(body.fontSize)) {
      allowed.fontSize = body.fontSize;
    }
    if (typeof body.articlesPerPage === 'number' && body.articlesPerPage > 0) {
      allowed.articlesPerPage = body.articlesPerPage;
    }

    if (Object.keys(allowed).length === 0) {
      return badRequest('No valid preference fields provided');
    }

    const prefs = await prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...allowed },
      update: allowed,
      select: {
        notificationsEnabled: true,
        theme: true,
        fontSize: true,
        articlesPerPage: true,
      },
    });

    return ok(prefs);
  } catch (error) {
    console.error('Preferences PATCH error:', error);
    return serverError('Failed to save preferences');
  }
}
