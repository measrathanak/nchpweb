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
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const roles = await prisma.role.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(roles);
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json() as { name?: string; permissions?: string[] };
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
  }
  const existing = await prisma.role.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: 'Role name already exists' }, { status: 409 });
  }
  const role = await prisma.role.create({
    data: { name, permissions: body.permissions ?? [] },
  });
  return NextResponse.json(role, { status: 201 });
}
