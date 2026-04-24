import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { badRequest, created, ok, serverError, unauthorized } from '@/app/api/_shared/http';
import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/auth/roles';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  if (!isAdminEmail(session.user.email)) return null;
  return session;
}

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return unauthorized('Admin access required');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ok(users);
  } catch (error) {
    console.error('Users GET error:', error);
    return serverError('Failed to fetch users');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return unauthorized('Admin access required');

    const body = await request.json();
    const { email, firstName, lastName, phone, password } = body as {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      password?: string;
    };

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return badRequest('Valid email is required');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await prisma.user.create({
      data: {
        email,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        name: [firstName, lastName].filter(Boolean).join(' ') || null,
        phone: phone ?? null,
        password: hashedPassword,
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

    return created(user);
  } catch (error) {
    console.error('Users POST error:', error);
    return serverError('Failed to create user');
  }
}
