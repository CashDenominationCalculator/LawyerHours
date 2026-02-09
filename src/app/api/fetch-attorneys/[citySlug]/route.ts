import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCityBySlug } from '@/lib/constants';
import { fetchNearbyLawyers, parseGooglePlace } from '@/lib/google-places';

export async function POST(
  request: NextRequest,
  { params }: { params: { citySlug: string } }
) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey || apiKey === 'your-google-places-api-key') {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    const cityData = getCityBySlug(params.citySlug);
    if (!cityData) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
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

    // Fetch from Google Places API
    const places = await fetchNearbyLawyers(cityData.lat, cityData.lng, apiKey);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const place of places) {
      const parsed = parseGooglePlace(place);

      try {
        // Check if attorney already exists
        const existing = await prisma.attorneyOffice.findUnique({
          where: { googlePlaceId: parsed.googlePlaceId },
        });

        if (existing) {
          // Update existing
          await prisma.attorneyOffice.update({
            where: { googlePlaceId: parsed.googlePlaceId },
            data: {
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
          // Create new
          const newAttorney = await prisma.attorneyOffice.create({
            data: {
              googlePlaceId: parsed.googlePlaceId,
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
              cityId: city.id,
              lastApiRefresh: new Date(),
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
      } catch (err) {
        console.error(`Error processing place ${parsed.googlePlaceId}:`, err);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      city: `${cityData.name}, ${cityData.stateCode}`,
      totalFromApi: places.length,
      created,
      updated,
      skipped,
    });
  } catch (error: any) {
    console.error('Fetch attorneys error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
