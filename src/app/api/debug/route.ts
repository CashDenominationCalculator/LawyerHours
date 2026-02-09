import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = [
    'DATABASE_URL',
    'POSTGRES_URL',
    'POSTGRES_URL_NON_POOLING', 
    'POSTGRES_PRISMA_URL',
    'POSTGRES_HOST',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DATABASE',
    'GOOGLE_PLACES_API_KEY',
  ];

  const result: Record<string, string> = {};
  for (const key of envVars) {
    const val = process.env[key];
    if (val) {
      result[key] = val.substring(0, 25) + '...[SET]';
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

  return NextResponse.json(result);
}
