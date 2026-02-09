import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CITIES } from '@/lib/constants';
import {
  fetchLawyersSmart,
  parseGooglePlace,
  validateApiKey,
  type FetchProgress,
} from '@/lib/google-places';

export const maxDuration = 300; // 5 minutes for bulk operations

// ==========================================
// BULK FETCH - Streams progress via SSE
// ==========================================

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const keyValidation = validateApiKey(apiKey);

  if (!keyValidation.valid) {
    return NextResponse.json(
      { error: keyValidation.error, code: 'INVALID_API_KEY' },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get('force') === 'true';
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : CITIES.length;
  const offsetParam = url.searchParams.get('offset');
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

  // Select cities to process
  const citiesToProcess = CITIES.slice(offset, offset + limit);

  // Stream progress via SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      sendEvent('start', {
        totalCities: citiesToProcess.length,
        force: forceRefresh,
        startedAt: new Date().toISOString(),
      });

      let totalCreated = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;
      let totalFromApi = 0;
      let citiesComplete = 0;
      let citiesError = 0;

      for (let i = 0; i < citiesToProcess.length; i++) {
        const cityData = citiesToProcess[i];
        const startTime = Date.now();

        sendEvent('city_start', {
          index: i + 1,
          total: citiesToProcess.length,
          city: `${cityData.name}, ${cityData.stateCode}`,
          slug: cityData.slug,
        });

        try {
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

          // Check if recently fetched (skip if not forced)
          if (!forceRefresh) {
            const recentAttorney = await prisma.attorneyOffice.findFirst({
              where: { cityId: city.id },
              orderBy: { lastApiRefresh: 'desc' },
              select: { lastApiRefresh: true },
            });

            if (recentAttorney?.lastApiRefresh) {
              const hoursSince = (Date.now() - recentAttorney.lastApiRefresh.getTime()) / (1000 * 60 * 60);
              if (hoursSince < 6) {
                const existingCount = await prisma.attorneyOffice.count({ where: { cityId: city.id } });
                sendEvent('city_skip', {
                  index: i + 1,
                  city: `${cityData.name}, ${cityData.stateCode}`,
                  reason: `Recently fetched ${hoursSince.toFixed(1)}h ago`,
                  existingCount,
                });
                citiesComplete++;
                continue;
              }
            }
          }

          // Fetch from Google Places
          const { places, strategy, apiCalls } = await fetchLawyersSmart(
            cityData.lat,
            cityData.lng,
            apiKey!,
            cityData.pop,
          );

          let created = 0;
          let updated = 0;
          let skipped = 0;

          for (const place of places) {
            const parsed = parseGooglePlace(place);

            try {
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
                await prisma.attorneyOffice.update({
                  where: { googlePlaceId: parsed.googlePlaceId },
                  data: { ...attorneyData, cityId: city.id },
                });

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
              const msg = err instanceof Error ? err.message : 'Unknown error';
              console.error(`Error processing place ${parsed.googlePlaceId}:`, msg);
              skipped++;
            }
          }

          totalCreated += created;
          totalUpdated += updated;
          totalSkipped += skipped;
          totalFromApi += places.length;
          citiesComplete++;

          const progress: FetchProgress = {
            city: `${cityData.name}, ${cityData.stateCode}`,
            status: 'complete',
            totalFromApi: places.length,
            created,
            updated,
            skipped,
            durationMs: Date.now() - startTime,
          };

          sendEvent('city_complete', {
            index: i + 1,
            ...progress,
            strategy,
            apiCalls,
          });

        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          citiesError++;

          sendEvent('city_error', {
            index: i + 1,
            city: `${cityData.name}, ${cityData.stateCode}`,
            error: message,
            durationMs: Date.now() - startTime,
          });
        }

        // Brief pause between cities to be nice to the API
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      sendEvent('complete', {
        totalCities: citiesToProcess.length,
        citiesComplete,
        citiesError,
        totalFromApi,
        totalCreated,
        totalUpdated,
        totalSkipped,
        completedAt: new Date().toISOString(),
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// ==========================================
// POST - Simple JSON batch fetch (non-streaming)
// ==========================================

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const keyValidation = validateApiKey(apiKey);

  if (!keyValidation.valid) {
    return NextResponse.json(
      { error: keyValidation.error, code: 'INVALID_API_KEY' },
      { status: 500 }
    );
  }

  let body: { citySlugs?: string[]; force?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // Use defaults
  }

  const citySlugs = body.citySlugs || CITIES.map((c) => c.slug);
  const force = body.force ?? false;

  const results: FetchProgress[] = [];

  for (const slug of citySlugs) {
    const cityData = CITIES.find((c) => c.slug === slug);
    if (!cityData) {
      results.push({
        city: slug,
        status: 'error',
        totalFromApi: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        error: `City not found: ${slug}`,
      });
      continue;
    }

    const startTime = Date.now();

    try {
      // Ensure city in DB
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

      // Skip if recently fetched
      if (!force) {
        const recentAttorney = await prisma.attorneyOffice.findFirst({
          where: { cityId: city.id },
          orderBy: { lastApiRefresh: 'desc' },
          select: { lastApiRefresh: true },
        });

        if (recentAttorney?.lastApiRefresh) {
          const hoursSince = (Date.now() - recentAttorney.lastApiRefresh.getTime()) / (1000 * 60 * 60);
          if (hoursSince < 6) {
            results.push({
              city: `${cityData.name}, ${cityData.stateCode}`,
              status: 'complete',
              totalFromApi: 0,
              created: 0,
              updated: 0,
              skipped: 0,
              durationMs: Date.now() - startTime,
            });
            continue;
          }
        }
      }

      const { places } = await fetchLawyersSmart(
        cityData.lat, cityData.lng, apiKey!, cityData.pop
      );

      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const place of places) {
        const parsed = parseGooglePlace(place);
        try {
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
            await prisma.attorneyOffice.update({
              where: { googlePlaceId: parsed.googlePlaceId },
              data: { ...attorneyData, cityId: city.id },
            });
            await prisma.secondaryHour.deleteMany({ where: { attorneyOfficeId: existing.id } });
            if (parsed.secondaryHours.length > 0) {
              await prisma.secondaryHour.createMany({
                data: parsed.secondaryHours.map((h) => ({ attorneyOfficeId: existing.id, ...h })),
              });
            }
            updated++;
          } else {
            const newAttorney = await prisma.attorneyOffice.create({
              data: { googlePlaceId: parsed.googlePlaceId, ...attorneyData, cityId: city.id },
            });
            if (parsed.secondaryHours.length > 0) {
              await prisma.secondaryHour.createMany({
                data: parsed.secondaryHours.map((h) => ({ attorneyOfficeId: newAttorney.id, ...h })),
              });
            }
            created++;
          }
        } catch {
          skipped++;
        }
      }

      results.push({
        city: `${cityData.name}, ${cityData.stateCode}`,
        status: 'complete',
        totalFromApi: places.length,
        created,
        updated,
        skipped,
        durationMs: Date.now() - startTime,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        city: `${cityData.name}, ${cityData.stateCode}`,
        status: 'error',
        totalFromApi: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        error: message,
        durationMs: Date.now() - startTime,
      });
    }

    // Rate limit between cities
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const summary = {
    totalCities: results.length,
    citiesComplete: results.filter((r) => r.status === 'complete').length,
    citiesError: results.filter((r) => r.status === 'error').length,
    totalFromApi: results.reduce((sum, r) => sum + r.totalFromApi, 0),
    totalCreated: results.reduce((sum, r) => sum + r.created, 0),
    totalUpdated: results.reduce((sum, r) => sum + r.updated, 0),
    totalSkipped: results.reduce((sum, r) => sum + r.skipped, 0),
  };

  return NextResponse.json({ summary, results });
}
