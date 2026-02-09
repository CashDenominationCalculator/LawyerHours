import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CITIES } from '@/lib/constants';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Protect setup endpoint with API key
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!key || key !== apiKey) {
    return NextResponse.json({ error: 'Unauthorized. Pass ?key=YOUR_API_KEY' }, { status: 401 });
  }

  try {
    // Create tables using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        "stateCode" VARCHAR(2) NOT NULL,
        "stateName" TEXT NOT NULL,
        "stateSlug" TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        population INTEGER,
        slug TEXT UNIQUE NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS attorney_offices (
        id SERIAL PRIMARY KEY,
        "googlePlaceId" TEXT UNIQUE NOT NULL,
        "displayName" TEXT NOT NULL,
        "formattedAddress" TEXT,
        "shortAddress" TEXT,
        "primaryType" TEXT,
        "primaryTypeDisplayName" TEXT,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        "googleMapsUri" TEXT,
        "websiteUri" TEXT,
        "acceptsCreditCards" BOOLEAN,
        "acceptsDebitCards" BOOLEAN,
        "cashOnly" BOOLEAN,
        "acceptsNfc" BOOLEAN,
        "freeParkingLot" BOOLEAN,
        "paidParkingLot" BOOLEAN,
        "freeStreetParking" BOOLEAN,
        "valetParking" BOOLEAN,
        "freeGarageParking" BOOLEAN,
        "paidGarageParking" BOOLEAN,
        "wheelchairAccessibleParking" BOOLEAN,
        "wheelchairAccessibleEntrance" BOOLEAN,
        "wheelchairAccessibleRestroom" BOOLEAN,
        "wheelchairAccessibleSeating" BOOLEAN,
        "practiceAreas" TEXT[] DEFAULT '{}',
        "cityId" INTEGER NOT NULL REFERENCES cities(id),
        "lastApiRefresh" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS secondary_hours (
        id SERIAL PRIMARY KEY,
        "attorneyOfficeId" INTEGER NOT NULL REFERENCES attorney_offices(id) ON DELETE CASCADE,
        "hoursType" TEXT NOT NULL,
        "dayOfWeek" INTEGER NOT NULL,
        "openHour" INTEGER NOT NULL,
        "openMinute" INTEGER DEFAULT 0 NOT NULL,
        "closeHour" INTEGER NOT NULL,
        "closeMinute" INTEGER DEFAULT 0 NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        "attorneyOfficeId" INTEGER REFERENCES attorney_offices(id),
        "sourcePageUrl" TEXT,
        "clientName" TEXT,
        "clientPhone" TEXT,
        "clientEmail" TEXT,
        "caseType" TEXT,
        "preferredTime" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // Seed cities
    let seeded = 0;
    for (const city of CITIES) {
      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO cities (name, "stateCode", "stateName", "stateSlug", latitude, longitude, population, slug, "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (slug) DO NOTHING`,
          city.name, city.stateCode, city.stateName, city.stateSlug, city.lat, city.lng, city.pop, city.slug
        );
        seeded++;
      } catch (e) {
        console.error(`Failed to seed ${city.name}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables created and cities seeded',
      citiesSeeded: seeded,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
