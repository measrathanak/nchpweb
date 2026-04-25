import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      language: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string | null;
  };

  const existing = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!existing) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const firstName = body.firstName?.trim() ?? existing.firstName ?? '';
  const lastName = body.lastName?.trim() ?? existing.lastName ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || existing.name || existing.email;

  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: {
      firstName,
      lastName,
      name: fullName,
      phone: body.phone !== undefined ? body.phone.trim() : existing.phone,
      avatar: body.avatar !== undefined ? body.avatar : existing.avatar,
    },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      language: true,
    },
  });

  return NextResponse.json(updated);
}
