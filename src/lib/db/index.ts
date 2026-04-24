/**
 * Prisma Client Singleton
 * Ensures a single Prisma instance across the app
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const connectionString = process.env.DATABASE_URL;

const adapter = connectionString
  ? new PrismaPg(new Pool({ connectionString }))
  : undefined;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    ...(adapter ? { adapter } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
