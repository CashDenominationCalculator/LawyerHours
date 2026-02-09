import { PrismaClient } from '@prisma/client';

// Supabase-Vercel integration provides these env vars:
// - POSTGRES_PRISMA_URL: pooled connection string for Prisma (port 6543, with pgbouncer)
// - POSTGRES_URL_NON_POOLING: direct connection for migrations (port 5432)
// - POSTGRES_URL: pooled connection
// - DATABASE_URL: may also be set
//
// Our schema uses:
//   url       = env("POSTGRES_PRISMA_URL")
//   directUrl = env("POSTGRES_URL_NON_POOLING")

function ensureEnvVars() {
  // If Supabase integration set POSTGRES_PRISMA_URL, we're good
  if (process.env.POSTGRES_PRISMA_URL) return;
  
  // Fallback: construct from DATABASE_URL or POSTGRES_URL
  const baseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (baseUrl) {
    // Set POSTGRES_PRISMA_URL if not present
    process.env.POSTGRES_PRISMA_URL = baseUrl;
    if (!process.env.POSTGRES_URL_NON_POOLING) {
      // Try to make a non-pooling URL (change port 6543 to 5432, remove pgbouncer)
      process.env.POSTGRES_URL_NON_POOLING = baseUrl
        .replace(':6543/', ':5432/')
        .replace('?pgbouncer=true', '');
    }
    return;
  }

  // Construct from individual Supabase vars
  const host = process.env.POSTGRES_HOST;
  const password = process.env.POSTGRES_PASSWORD;
  const user = process.env.POSTGRES_USER || 'postgres';
  const database = process.env.POSTGRES_DATABASE || 'postgres';

  if (host && password) {
    const encodedPassword = encodeURIComponent(password);
    process.env.POSTGRES_PRISMA_URL = `postgresql://${user}:${encodedPassword}@${host}:6543/${database}?pgbouncer=true`;
    process.env.POSTGRES_URL_NON_POOLING = `postgresql://${user}:${encodedPassword}@${host}:5432/${database}`;
  }
}

ensureEnvVars();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
