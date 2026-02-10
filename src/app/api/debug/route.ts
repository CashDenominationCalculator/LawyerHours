import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Simple admin protection - require ?key= matching API key
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!key || key !== apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const query = url.searchParams.get('q') || 'env';

  // Query: primaryType distribution
  if (query === 'types') {
    try {
      const typeDistribution = await prisma.$queryRawUnsafe(`
        SELECT "primaryTypeDisplayName", "primaryType", COUNT(*)::int as count 
        FROM attorney_offices 
        GROUP BY "primaryTypeDisplayName", "primaryType"
        ORDER BY count DESC
        LIMIT 50
      `);
      
      const taxInType = await prisma.$queryRawUnsafe(`
        SELECT "displayName", "primaryType", "primaryTypeDisplayName", "practiceAreas"
        FROM attorney_offices 
        WHERE LOWER("primaryTypeDisplayName") LIKE '%tax%'
        LIMIT 20
      `);
      
      const taxInPractice = await prisma.$queryRawUnsafe(`
        SELECT "displayName", "primaryType", "primaryTypeDisplayName", "practiceAreas"
        FROM attorney_offices 
        WHERE 'tax' = ANY("practiceAreas")
        LIMIT 30
      `);

      const practiceAreaStats = await prisma.$queryRawUnsafe(`
        SELECT unnest("practiceAreas") as practice_area, COUNT(*)::int as count
        FROM attorney_offices
        GROUP BY practice_area
        ORDER BY count DESC
      `);

      return NextResponse.json({
        typeDistribution,
        taxInPrimaryTypeDisplayName: taxInType,
        taxInPracticeAreas: taxInPractice,
        practiceAreaStats,
      });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'unknown' });
    }
  }

  // Default: env check
  const envVars = [
    'DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_URL_NON_POOLING', 
    'POSTGRES_PRISMA_URL', 'POSTGRES_HOST', 'POSTGRES_USER', 'POSTGRES_DATABASE',
  ];

  const result: Record<string, string> = {};
  for (const envKey of envVars) {
    const val = process.env[envKey];
    result[envKey] = val ? val.replace(/:[^@]+@/, ':***@').substring(0, 80) + '...' : '[NOT SET]';
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
