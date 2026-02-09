import { PrismaClient } from '@prisma/client';

// Build DATABASE_URL from Supabase-Vercel integration env vars if not directly set
function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.POSTGRES_PRISMA_URL) return process.env.POSTGRES_PRISMA_URL;
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
  
  // Construct from individual Supabase vars
  const host = process.env.POSTGRES_HOST;
  const password = process.env.POSTGRES_PASSWORD;
  const user = process.env.POSTGRES_USER || 'postgres';
  const database = process.env.POSTGRES_DATABASE || 'postgres';
  
  if (host && password) {
    return `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/${database}?pgbouncer=true`;
  }
  
  return '';
}

const dbUrl = getDatabaseUrl();
if (dbUrl && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: dbUrl || undefined,
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
