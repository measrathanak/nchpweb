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

export async function GET() {
  const languages = await prisma.language.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json(languages);
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json() as {
    name?: string;
    code?: string;
    nativeName?: string;
    flagEmoji?: string;
    sortOrder?: number;
  };

  const name = body.name?.trim();
  const code = body.code?.trim().toLowerCase();
  if (!name || !code) {
    return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
  }

  const existing = await prisma.language.findFirst({
    where: { OR: [{ name }, { code }] },
  });
  if (existing) {
    return NextResponse.json({ error: 'Language name or code already exists' }, { status: 409 });
  }

  const language = await prisma.language.create({
    data: {
      name,
      code,
      nativeName: body.nativeName ?? null,
      flagEmoji: body.flagEmoji ?? null,
      sortOrder: body.sortOrder ?? 999,
    },
  });
  return NextResponse.json(language, { status: 201 });
}
