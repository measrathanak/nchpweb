import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { getUserRole, hasRoleAccess } from '@/lib/auth/roles';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const role = getUserRole(session.user.email);
  return hasRoleAccess(role, 'admin');
}

export async function GET(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.trim() || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const skip = (page - 1) * limit;

  const where = email ? { email: { contains: email, mode: 'insensitive' as const } } : {};

  const [audits, total] = await Promise.all([
    prisma.loginAudit.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
    }),
    prisma.loginAudit.count({ where }),
  ]);

  return NextResponse.json({
    data: audits,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}
