import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const envVars = [
    'DATABASE_URL',
    'POSTGRES_URL',
    'POSTGRES_URL_NON_POOLING', 
    'POSTGRES_PRISMA_URL',
    'POSTGRES_HOST',
    'POSTGRES_USER',
    'POSTGRES_DATABASE',
    'GOOGLE_PLACES_API_KEY',
  ];

  const result: Record<string, string> = {};
  for (const key of envVars) {
    const val = process.env[key];
    if (val) {
      // Show structure but mask sensitive parts
      result[key] = val.replace(/:[^@]+@/, ':***@').substring(0, 80) + (val.length > 80 ? '...' : '');
    } else {
      result[key] = '[NOT SET]';
    }
  }

  // Show which URL Prisma will actually use
  result['_prisma_will_use'] = process.env.POSTGRES_PRISMA_URL 
    ? 'POSTGRES_PRISMA_URL' 
    : process.env.DATABASE_URL 
      ? 'DATABASE_URL (fallback)' 
      : 'NONE - will fail';

  // Try a simple query  
  try {
    const cityCount = await prisma.city.count();
    const attorneyCount = await prisma.attorneyOffice.count();
    result['_db_test'] = `OK: ${cityCount} cities, ${attorneyCount} attorneys`;
  } catch (err) {
    result['_db_test'] = `ERROR: ${err instanceof Error ? err.message.substring(0, 200) : 'unknown'}`;
  }

  return NextResponse.json(result);
}
