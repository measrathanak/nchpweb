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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json() as { name?: string; permissions?: string[] };
  const data: { name?: string; permissions?: string[] } = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    data.name = name;
  }
  if (body.permissions !== undefined) {
    data.permissions = body.permissions;
  }
  try {
    const updated = await prisma.role.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  try {
    await prisma.role.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }
}
