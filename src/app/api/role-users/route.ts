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

// GET /api/role-users?roleId=xxx → { userIds: string[] }
export async function GET(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const roleId = searchParams.get('roleId');
  if (!roleId) {
    return NextResponse.json({ error: 'roleId is required' }, { status: 400 });
  }
  const assignments = await prisma.userRoleAssignment.findMany({
    where: { roleId },
    select: { userId: true },
  });
  return NextResponse.json({ userIds: assignments.map((a) => a.userId) });
}

// POST /api/role-users  body: { userId, roleId }
export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json() as { userId?: string; roleId?: string };
  if (!body.userId || !body.roleId) {
    return NextResponse.json({ error: 'userId and roleId are required' }, { status: 400 });
  }
  const assignment = await prisma.userRoleAssignment.upsert({
    where: { userId_roleId: { userId: body.userId, roleId: body.roleId } },
    update: {},
    create: { userId: body.userId, roleId: body.roleId },
  });
  return NextResponse.json(assignment, { status: 201 });
}

// DELETE /api/role-users  body: { userId, roleId }
export async function DELETE(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json() as { userId?: string; roleId?: string };
  if (!body.userId || !body.roleId) {
    return NextResponse.json({ error: 'userId and roleId are required' }, { status: 400 });
  }
  await prisma.userRoleAssignment.deleteMany({
    where: { userId: body.userId, roleId: body.roleId },
  });
  return NextResponse.json({ ok: true });
}
