import { NextResponse } from 'next/server';

export async function GET() {
  // Check which Supabase/Postgres env vars are set (values hidden for security)
  const envVars = [
    'DATABASE_URL',
    'POSTGRES_URL',
    'POSTGRES_URL_NON_POOLING', 
    'POSTGRES_PRISMA_URL',
    'POSTGRES_HOST',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DATABASE',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GOOGLE_PLACES_API_KEY',
    'NEXT_PUBLIC_SITE_URL',
  ];

  const result: Record<string, string> = {};
  for (const key of envVars) {
    const val = process.env[key];
    if (val) {
      // Show first 20 chars + mask rest
      result[key] = val.substring(0, 20) + '...[SET]';
    } else {
      result[key] = '[NOT SET]';
    }
  }

  return NextResponse.json(result);
}
