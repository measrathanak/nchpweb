import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const now = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      checks: {
        database: 'ok',
      },
      timestamp: now,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        checks: {
          database: 'error',
        },
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: now,
      },
      { status: 503 }
    );
  }
}