/**
 * Database Utility Functions
 * High-level functions for common database operations
 */

import prisma from '@/lib/db';
import { Locale } from '@/lib/i18n';
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';

// ============================================================================
// User Functions
// ============================================================================

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { preferences: true },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { preferences: true },
  });
}

export async function createUser(data: {
  email: string;
  name?: string;
  language?: Locale;
}) {
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      language: data.language || 'en',
      preferences: {
        create: {
          theme: 'light',
          fontSize: 'medium',
        },
      },
    },
    include: { preferences: true },
  });
}

// ============================================================================
// Session Functions
// ============================================================================

export async function createSession(userId: string, expiresIn: number = 30) {
  const expires = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);
  const sessionToken = randomBytes(32).toString('hex');

  return prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });
}

export async function getSession(sessionToken: string) {
  return prisma.session.findUnique({
    where: { sessionToken },
    include: { user: { include: { preferences: true } } },
  });
}

export async function deleteSession(sessionToken: string) {
  return prisma.session.delete({
    where: { sessionToken },
  });
}

// ============================================================================
// Saved Articles Functions
// ============================================================================

export async function saveArticle(
  userId: string,
  data: {
    typo3ArticleUid: number;
    title: string;
    slug: string;
    language: Locale;
  }
) {
  return prisma.savedArticle.upsert({
    where: {
      userId_typo3ArticleUid_language: {
        userId,
        typo3ArticleUid: data.typo3ArticleUid,
        language: data.language,
      },
    },
    update: { savedAt: new Date() },
    create: {
      userId,
      ...data,
    },
  });
}

export async function removeSavedArticle(
  userId: string,
  typo3ArticleUid: number,
  language: Locale
) {
  return prisma.savedArticle.delete({
    where: {
      userId_typo3ArticleUid_language: {
        userId,
        typo3ArticleUid,
        language,
      },
    },
  });
}

export async function getUserSavedArticles(userId: string, language?: Locale) {
  return prisma.savedArticle.findMany({
    where: {
      userId,
      ...(language && { language }),
    },
    orderBy: { savedAt: 'desc' },
  });
}

// ============================================================================
// Search Cache Functions
// ============================================================================

export async function getCachedSearch(query: string, language: Locale) {
  const cached = await prisma.searchCache.findUnique({
    where: {
      query_language: { query, language },
    },
  });

  // Return null if cache expired
  if (cached && cached.expiresAt < new Date()) {
    await prisma.searchCache.delete({
      where: { id: cached.id },
    });
    return null;
  }

  // Increment hit count
  if (cached) {
    await prisma.searchCache.update({
      where: { id: cached.id },
      data: { hits: { increment: 1 } },
    });
  }

  return cached;
}

export async function cacheSearch(
  query: string,
  language: Locale,
  results: unknown,
  expiresIn: number = 24 // hours
) {
  const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000);
  const resultCount = Array.isArray(results) ? results.length : 0;
  const resultsJson = results as Prisma.InputJsonValue;

  return prisma.searchCache.upsert({
    where: {
      query_language: { query, language },
    },
    update: {
      results: resultsJson,
      resultCount,
      expiresAt,
      hits: { increment: 1 },
    },
    create: {
      query,
      language,
      results: resultsJson,
      resultCount,
      expiresAt,
    },
  });
}

export async function clearExpiredSearchCache() {
  return prisma.searchCache.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

// ============================================================================
// Form Submission Functions
// ============================================================================

export async function submitForm(data: {
  formType: 'contact' | 'newsletter' | 'feedback';
  formData: Record<string, unknown>;
  email: string;
  name?: string;
  phone?: string;
  userId?: string;
}) {
  return prisma.formSubmission.create({
    data: {
      formType: data.formType,
      formData: data.formData as Prisma.InputJsonValue,
      email: data.email,
      name: data.name,
      phone: data.phone,
      userId: data.userId,
      status: 'pending',
    },
  });
}

export async function getFormSubmissions(formType?: string, limit: number = 50) {
  return prisma.formSubmission.findMany({
    where: formType ? { formType } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function updateFormSubmissionStatus(
  id: string,
  status: 'pending' | 'reviewed' | 'resolved',
  notes?: string
) {
  return prisma.formSubmission.update({
    where: { id },
    data: { status, notes },
  });
}

// ============================================================================
// Analytics Functions
// ============================================================================

export async function recordPageView(data: {
  userId?: string;
  path: string;
  title?: string;
  referrer?: string;
  language: Locale;
  userAgent?: string;
  ipAddress?: string;
  loadTime?: number;
}) {
  return prisma.pageView.create({
    data,
  });
}

export async function getPageViewStats(path?: string, days: number = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return prisma.pageView.groupBy({
    by: path ? [] : ['path'],
    where: {
      timestamp: { gte: since },
      ...(path && { path }),
    },
    _count: {
      id: true,
    },
  });
}

// ============================================================================
// Content Queue Functions
// ============================================================================

export async function queueContentAction(
  action: string,
  payload: Record<string, unknown>
) {
  return prisma.contentQueue.create({
    data: {
      action,
      payload: payload as Prisma.InputJsonValue,
      status: 'pending',
    },
  });
}

export async function getQueuedActions(limit: number = 10) {
  return prisma.contentQueue.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
}

export async function completeQueuedAction(id: string) {
  return prisma.contentQueue.update({
    where: { id },
    data: { status: 'completed', processedAt: new Date() },
  });
}

export async function failQueuedAction(id: string, error: string) {
  const action = await prisma.contentQueue.findUnique({
    where: { id },
  });

  if (!action) throw new Error('Action not found');

  const newAttempts = action.attempts + 1;
  const status = newAttempts >= action.maxAttempts ? 'failed' : 'pending';

  return prisma.contentQueue.update({
    where: { id },
    data: {
      status,
      attempts: newAttempts,
      error,
    },
  });
}
