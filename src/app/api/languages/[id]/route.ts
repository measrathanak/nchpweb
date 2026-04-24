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

interface Params {
  id: string;
}

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json() as {
    name?: string;
    code?: string;
    nativeName?: string;
    flagEmoji?: string;
    enabled?: boolean;
    sortOrder?: number;
  };

  const language = await prisma.language.findUnique({ where: { id } });
  if (!language) {
    return NextResponse.json({ error: 'Language not found' }, { status: 404 });
  }

  const updated = await prisma.language.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name.trim() }),
      ...(body.code && { code: body.code.trim().toLowerCase() }),
      ...(body.nativeName !== undefined && { nativeName: body.nativeName }),
      ...(body.flagEmoji !== undefined && { flagEmoji: body.flagEmoji }),
      ...(body.enabled !== undefined && { enabled: body.enabled }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<Params> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const language = await prisma.language.findUnique({ where: { id } });
  if (!language) {
    return NextResponse.json({ error: 'Language not found' }, { status: 404 });
  }

  await prisma.language.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
