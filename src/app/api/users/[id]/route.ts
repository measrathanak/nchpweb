import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { badRequest, ok, serverError, unauthorized } from '@/app/api/_shared/http';
import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/auth/roles';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  if (!isAdminEmail(session.user.email)) return null;
  return session;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return unauthorized('Admin access required');

    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, phone } = body as {
      firstName?: string;
      lastName?: string;
      phone?: string;
    };

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName ?? existing.firstName,
        lastName: lastName ?? existing.lastName,
        name: [firstName ?? existing.firstName, lastName ?? existing.lastName].filter(Boolean).join(' ') || existing.name,
        phone: phone !== undefined ? phone : existing.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });

    return ok(updated);
  } catch (error) {
    console.error('Users PATCH error:', error);
    return serverError('Failed to update user');
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return unauthorized('Admin access required');

    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting own account
    if (existing.email === session.user?.email) {
      return badRequest('Cannot delete your own account');
    }

    await prisma.user.delete({ where: { id } });

    return ok({ success: true });
  } catch (error) {
    console.error('Users DELETE error:', error);
    return serverError('Failed to delete user');
  }
}
