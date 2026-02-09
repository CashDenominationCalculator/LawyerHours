import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCityBySlug } from '@/lib/constants';
import {
  fetchLawyersSmart,
  parseGooglePlace,
  validateApiKey,
  type FetchStrategy,
  type FetchProgress,
} from '@/lib/google-places';

export const maxDuration = 60; // Allow up to 60s for API calls

export async function POST(
  request: NextRequest,
  { params }: { params: { citySlug: string } }
) {
  const startTime = Date.now();

  try {
    // Validate API key
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const keyValidation = validateApiKey(apiKey);
    if (!keyValidation.valid) {
      return NextResponse.json(
        { error: keyValidation.error, code: 'INVALID_API_KEY' },
        { status: 500 }
      );
    }

    // Parse optional query params
    const url = new URL(request.url);
    const strategyParam = url.searchParams.get('strategy') as FetchStrategy | null;
    const forceRefresh = url.searchParams.get('force') === 'true';

    // Validate city
    const cityData = getCityBySlug(params.citySlug);
    if (!cityData) {
      return NextResponse.json(
        { error: `City not found: ${params.citySlug}`, code: 'CITY_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if we recently fetched (within 6 hours) unless forced
    if (!forceRefresh) {
      try {
        const existingCity = await prisma.city.findUnique({
          where: { slug: cityData.slug },
          include: {
            attorneyOffices: {
              select: { lastApiRefresh: true },
              orderBy: { lastApiRefresh: 'desc' },
              take: 1,
            },
          },
        });

        if (existingCity?.attorneyOffices?.[0]?.lastApiRefresh) {
          const lastRefresh = existingCity.attorneyOffices[0].lastApiRefresh;
          const hoursSinceRefresh = (Date.now() - lastRefresh.getTime()) / (1000 * 60 * 60);

          if (hoursSinceRefresh < 6) {
            const existingCount = await prisma.attorneyOffice.count({
              where: { cityId: existingCity.id },
            });

            return NextResponse.json({
              success: true,
              city: `${cityData.name}, ${cityData.stateCode}`,
              message: `Recently fetched ${hoursSinceRefresh.toFixed(1)} hours ago. Use ?force=true to override.`,
              cached: true,
              totalInDb: existingCount,
              lastRefresh: lastRefresh.toISOString(),
            });
          }
        }
      } catch {
        // DB not available, continue with fetch
      }
    }

    // Ensure city exists in DB
    let city = await prisma.city.findUnique({ where: { slug: cityData.slug } });
    if (!city) {
      city = await prisma.city.create({
        data: {
          name: cityData.name,
          stateCode: cityData.stateCode,
          stateName: cityData.stateName,
          stateSlug: cityData.stateSlug,
          latitude: cityData.lat,
          longitude: cityData.lng,
          population: cityData.pop,
          slug: cityData.slug,
        },
      });
    }

    // Fetch from Google Places API (smart strategy)
    const { places, strategy, apiCalls } = await fetchLawyersSmart(
      cityData.lat,
      cityData.lng,
      apiKey!,
      cityData.pop,
      strategyParam || undefined
    );

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const place of places) {
      const parsed = parseGooglePlace(place);

      try {
        // Check if attorney already exists
        const existing = await prisma.attorneyOffice.findUnique({
          where: { googlePlaceId: parsed.googlePlaceId },
        });

        const attorneyData = {
          displayName: parsed.displayName,
          formattedAddress: parsed.formattedAddress,
          shortAddress: parsed.shortAddress,
          primaryType: parsed.primaryType,
          primaryTypeDisplayName: parsed.primaryTypeDisplayName,
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          googleMapsUri: parsed.googleMapsUri,
          websiteUri: parsed.websiteUri,
          acceptsCreditCards: parsed.acceptsCreditCards,
          acceptsDebitCards: parsed.acceptsDebitCards,
          cashOnly: parsed.cashOnly,
          acceptsNfc: parsed.acceptsNfc,
          freeParkingLot: parsed.freeParkingLot,
          paidParkingLot: parsed.paidParkingLot,
          freeStreetParking: parsed.freeStreetParking,
          valetParking: parsed.valetParking,
          freeGarageParking: parsed.freeGarageParking,
          paidGarageParking: parsed.paidGarageParking,
          wheelchairAccessibleParking: parsed.wheelchairAccessibleParking,
          wheelchairAccessibleEntrance: parsed.wheelchairAccessibleEntrance,
          wheelchairAccessibleRestroom: parsed.wheelchairAccessibleRestroom,
          wheelchairAccessibleSeating: parsed.wheelchairAccessibleSeating,
          practiceAreas: parsed.practiceAreas,
          lastApiRefresh: new Date(),
        };

        if (existing) {
          // Update existing attorney
          await prisma.attorneyOffice.update({
            where: { googlePlaceId: parsed.googlePlaceId },
            data: {
              ...attorneyData,
              cityId: city.id, // Re-associate with correct city
            },
          });

          // Delete old secondary hours and re-create
          await prisma.secondaryHour.deleteMany({
            where: { attorneyOfficeId: existing.id },
          });

          if (parsed.secondaryHours.length > 0) {
            await prisma.secondaryHour.createMany({
              data: parsed.secondaryHours.map((h) => ({
                attorneyOfficeId: existing.id,
                ...h,
              })),
            });
          }

          updated++;
        } else {
          // Create new attorney
          const newAttorney = await prisma.attorneyOffice.create({
            data: {
              googlePlaceId: parsed.googlePlaceId,
              ...attorneyData,
              cityId: city.id,
            },
          });

          if (parsed.secondaryHours.length > 0) {
            await prisma.secondaryHour.createMany({
              data: parsed.secondaryHours.map((h) => ({
                attorneyOfficeId: newAttorney.id,
                ...h,
              })),
            });
          }

          created++;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error processing place ${parsed.googlePlaceId}:`, message);
        errors.push(`${parsed.displayName}: ${message}`);
        skipped++;
      }
    }

    const durationMs = Date.now() - startTime;

    const progress: FetchProgress = {
      city: `${cityData.name}, ${cityData.stateCode}`,
      status: 'complete',
      totalFromApi: places.length,
      created,
      updated,
      skipped,
      durationMs,
    };

    return NextResponse.json({
      success: true,
      ...progress,
      strategy,
      apiCalls,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Fetch attorneys error:', message);

    return NextResponse.json(
      {
        error: message,
        code: message.includes('API error') ? 'API_ERROR' : 'INTERNAL_ERROR',
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check status for a city
export async function GET(
  request: NextRequest,
  { params }: { params: { citySlug: string } }
) {
  try {
    const cityData = getCityBySlug(params.citySlug);
    if (!cityData) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    const city = await prisma.city.findUnique({
      where: { slug: cityData.slug },
      include: {
        _count: { select: { attorneyOffices: true } },
        attorneyOffices: {
          select: { lastApiRefresh: true },
          orderBy: { lastApiRefresh: 'desc' },
          take: 1,
        },
      },
    });

    if (!city) {
      return NextResponse.json({
        city: `${cityData.name}, ${cityData.stateCode}`,
        slug: cityData.slug,
        totalAttorneys: 0,
        lastRefresh: null,
        needsFetch: true,
      });
    }

    const lastRefresh = city.attorneyOffices?.[0]?.lastApiRefresh || null;
    const hoursSinceRefresh = lastRefresh
      ? (Date.now() - lastRefresh.getTime()) / (1000 * 60 * 60)
      : null;

    // Count attorneys with secondary hours
    const withHours = await prisma.attorneyOffice.count({
      where: {
        cityId: city.id,
        secondaryHours: { some: {} },
      },
    });

    return NextResponse.json({
      city: `${cityData.name}, ${cityData.stateCode}`,
      slug: cityData.slug,
      totalAttorneys: city._count.attorneyOffices,
      attorneysWithHours: withHours,
      lastRefresh: lastRefresh?.toISOString() || null,
      hoursSinceRefresh: hoursSinceRefresh ? parseFloat(hoursSinceRefresh.toFixed(1)) : null,
      needsFetch: !lastRefresh || hoursSinceRefresh! > 168, // 1 week
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
