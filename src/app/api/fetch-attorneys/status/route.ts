import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CITIES } from '@/lib/constants';
import { validateApiKey } from '@/lib/google-places';

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const keyValidation = validateApiKey(apiKey);

    // Get all cities with their attorney counts
    const dbCities = await prisma.city.findMany({
      include: {
        _count: { select: { attorneyOffices: true } },
        attorneyOffices: {
          select: { lastApiRefresh: true },
          orderBy: { lastApiRefresh: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    const cityStatusMap = new Map(
      dbCities.map((c) => [
        c.slug,
        {
          totalAttorneys: c._count.attorneyOffices,
          lastRefresh: c.attorneyOffices?.[0]?.lastApiRefresh?.toISOString() || null,
        },
      ])
    );

    const cities = CITIES.map((c) => {
      const status = cityStatusMap.get(c.slug);
      const lastRefresh = status?.lastRefresh ? new Date(status.lastRefresh) : null;
      const hoursSince = lastRefresh
        ? (Date.now() - lastRefresh.getTime()) / (1000 * 60 * 60)
        : null;

      return {
        name: c.name,
        stateCode: c.stateCode,
        slug: c.slug,
        population: c.pop,
        totalAttorneys: status?.totalAttorneys || 0,
        lastRefresh: status?.lastRefresh || null,
        hoursSinceRefresh: hoursSince ? parseFloat(hoursSince.toFixed(1)) : null,
        status: !lastRefresh
          ? 'never_fetched'
          : hoursSince! < 6
          ? 'fresh'
          : hoursSince! < 168
          ? 'stale'
          : 'very_stale',
      };
    });

    // Summary stats
    const totalAttorneys = cities.reduce((sum, c) => sum + c.totalAttorneys, 0);
    const citiesFetched = cities.filter((c) => c.totalAttorneys > 0).length;
    const citiesNeverFetched = cities.filter((c) => c.status === 'never_fetched').length;
    const citiesFresh = cities.filter((c) => c.status === 'fresh').length;
    const citiesStale = cities.filter((c) => c.status === 'stale' || c.status === 'very_stale').length;

    // Count total secondary hours
    const totalSecondaryHours = await prisma.secondaryHour.count();
    const attorneysWithHours = await prisma.attorneyOffice.count({
      where: { secondaryHours: { some: {} } },
    });

    return NextResponse.json({
      apiKeyConfigured: keyValidation.valid,
      summary: {
        totalCities: CITIES.length,
        citiesFetched,
        citiesNeverFetched,
        citiesFresh,
        citiesStale,
        totalAttorneys,
        attorneysWithHours,
        totalSecondaryHours,
      },
      cities,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: message,
        apiKeyConfigured: false,
        summary: {
          totalCities: CITIES.length,
          citiesFetched: 0,
          citiesNeverFetched: CITIES.length,
          citiesFresh: 0,
          citiesStale: 0,
          totalAttorneys: 0,
          attorneysWithHours: 0,
          totalSecondaryHours: 0,
        },
        cities: CITIES.map((c) => ({
          name: c.name,
          stateCode: c.stateCode,
          slug: c.slug,
          population: c.pop,
          totalAttorneys: 0,
          lastRefresh: null,
          hoursSinceRefresh: null,
          status: 'never_fetched',
        })),
      },
      { status: 200 } // Return 200 even on DB error so admin page can still render
    );
  }
}
