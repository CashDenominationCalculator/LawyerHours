import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Simple admin protection - require ?key= matching API key
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!key || key !== apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const envVars = [
    'DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_URL_NON_POOLING', 
    'POSTGRES_PRISMA_URL', 'POSTGRES_HOST', 'POSTGRES_USER', 'POSTGRES_DATABASE',
  ];

  const result: Record<string, string> = {};
  for (const key of envVars) {
    const val = process.env[key];
    result[key] = val ? val.replace(/:[^@]+@/, ':***@').substring(0, 80) + '...' : '[NOT SET]';
  }

  try {
    const cityCount = await prisma.city.count();
    const attorneyCount = await prisma.attorneyOffice.count();
    result['_db_status'] = `OK: ${cityCount} cities, ${attorneyCount} attorneys`;
  } catch (err) {
    result['_db_status'] = `ERROR: ${err instanceof Error ? err.message.substring(0, 200) : 'unknown'}`;
  }

  return NextResponse.json(result);
}
