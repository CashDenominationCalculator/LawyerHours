import { classifyPracticeAreas, parseGoogleSecondaryHours, parseRegularOpeningHours } from './attorneys';

// ==========================================
// GOOGLE PLACES API (New) - LIVE INTEGRATION
// ==========================================

const API_ENDPOINT = 'https://places.googleapis.com/v1/places:searchNearby';
const TEXT_SEARCH_ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.shortFormattedAddress',
  'places.primaryType',
  'places.primaryTypeDisplayName',
  'places.location',
  'places.regularOpeningHours',
  'places.regularSecondaryOpeningHours',
  'places.paymentOptions',
  'places.parkingOptions',
  'places.accessibilityOptions',
  'places.googleMapsUri',
  'places.websiteUri',
].join(',');

// ==========================================
// PRACTICE AREA TEXT SEARCH QUERIES
// ==========================================

// These queries are used with the Text Search API to find
// specific types of attorneys that the generic "lawyer" type won't distinguish
const PRACTICE_AREA_SEARCH_QUERIES: Record<string, string[]> = {
  'tax': ['tax attorney', 'tax lawyer', 'IRS attorney', 'tax resolution'],
  'personal-injury': ['personal injury attorney', 'personal injury lawyer', 'injury lawyer'],
  'criminal-defense': ['criminal defense attorney', 'criminal defense lawyer', 'criminal lawyer'],
  'dui': ['DUI attorney', 'DUI lawyer', 'DWI attorney'],
  'divorce': ['divorce attorney', 'divorce lawyer'],
  'family-law': ['family law attorney', 'family lawyer', 'custody attorney'],
  'immigration': ['immigration attorney', 'immigration lawyer', 'visa attorney'],
  'bankruptcy': ['bankruptcy attorney', 'bankruptcy lawyer'],
  'real-estate': ['real estate attorney', 'real estate lawyer', 'property attorney'],
  'estate-planning': ['estate planning attorney', 'probate attorney', 'wills and trusts attorney'],
  'employment': ['employment attorney', 'employment lawyer', 'labor attorney'],
  'workers-compensation': ['workers compensation attorney', 'workers comp lawyer'],
  'medical-malpractice': ['medical malpractice attorney', 'medical malpractice lawyer'],
  'car-accident': ['car accident attorney', 'auto accident lawyer'],
  'traffic-ticket': ['traffic ticket attorney', 'traffic lawyer'],
};

// ==========================================
// TYPES
// ==========================================

export interface GooglePlaceResult {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  primaryType?: string;
  primaryTypeDisplayName?: { text: string; languageCode?: string };
  location?: { latitude: number; longitude: number };
  regularOpeningHours?: {
    openNow?: boolean;
    periods?: {
      open: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }[];
    weekdayDescriptions?: string[];
  };
  regularSecondaryOpeningHours?: {
    secondaryHoursType?: string;
    hoursType?: string;
    periods?: {
      open?: { day?: number; hour?: number; minute?: number };
      close?: { day?: number; hour?: number; minute?: number };
    }[];
  }[];
  paymentOptions?: {
    acceptsCreditCards?: boolean;
    acceptsDebitCards?: boolean;
    acceptsCashOnly?: boolean;
    acceptsNfc?: boolean;
  };
  parkingOptions?: {
    freeParkingLot?: boolean;
    paidParkingLot?: boolean;
    freeStreetParking?: boolean;
    valetParking?: boolean;
    freeGarageParking?: boolean;
    paidGarageParking?: boolean;
  };
  accessibilityOptions?: {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  };
  googleMapsUri?: string;
  websiteUri?: string;
}

// Extended result that carries practice area context from Text Search
export interface GooglePlaceResultWithContext extends GooglePlaceResult {
  _searchContext?: string; // practice area slug from text search
}

export interface ParsedAttorney {
  googlePlaceId: string;
  displayName: string;
  formattedAddress: string | null;
  shortAddress: string | null;
  primaryType: string | null;
  primaryTypeDisplayName: string | null;
  latitude: number;
  longitude: number;
  googleMapsUri: string | null;
  websiteUri: string | null;
  acceptsCreditCards: boolean | null;
  acceptsDebitCards: boolean | null;
  cashOnly: boolean | null;
  acceptsNfc: boolean | null;
  freeParkingLot: boolean | null;
  paidParkingLot: boolean | null;
  freeStreetParking: boolean | null;
  valetParking: boolean | null;
  freeGarageParking: boolean | null;
  paidGarageParking: boolean | null;
  wheelchairAccessibleParking: boolean | null;
  wheelchairAccessibleEntrance: boolean | null;
  wheelchairAccessibleRestroom: boolean | null;
  wheelchairAccessibleSeating: boolean | null;
  practiceAreas: string[];
  secondaryHours: {
    hoursType: string;
    dayOfWeek: number;
    openHour: number;
    openMinute: number;
    closeHour: number;
    closeMinute: number;
  }[];
}

export interface FetchProgress {
  city: string;
  status: 'pending' | 'fetching' | 'parsing' | 'storing' | 'complete' | 'error';
  totalFromApi: number;
  created: number;
  updated: number;
  skipped: number;
  error?: string;
  durationMs?: number;
}

// ==========================================
// RATE LIMITER
// ==========================================

class RateLimiter {
  private lastRequestTime = 0;
  private readonly minIntervalMs: number;

  constructor(requestsPerSecond: number = 5) {
    this.minIntervalMs = Math.ceil(1000 / requestsPerSecond);
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();
  }
}

const rateLimiter = new RateLimiter(5); // 5 requests per second

// ==========================================
// CORE FETCH FUNCTION (Nearby Search)
// ==========================================

export async function fetchNearbyLawyers(
  latitude: number,
  longitude: number,
  apiKey: string,
  radius: number = 25000,
  maxResults: number = 20
): Promise<GooglePlaceResult[]> {
  await rateLimiter.wait();

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes: ['lawyer'],
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius,
        },
      },
      maxResultCount: maxResults,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail = errorText;
    try {
      const parsed = JSON.parse(errorText);
      errorDetail = parsed.error?.message || parsed.error?.status || errorText;
    } catch {
      // use raw text
    }
    throw new Error(`Google Places API error ${response.status}: ${errorDetail}`);
  }

  const data = await response.json();
  return data.places || [];
}

// ==========================================
// TEXT SEARCH FUNCTION (for specific practice areas)
// ==========================================

/**
 * Search for specific types of attorneys using Google Places Text Search API.
 * This returns attorneys that Google specifically recognizes as that type,
 * which is much more accurate than keyword-matching display names.
 *
 * Example: "tax attorney in Dallas, TX" returns actual tax attorneys,
 * not generic law firms.
 */
export async function fetchLawyersByTextSearch(
  textQuery: string,
  latitude: number,
  longitude: number,
  apiKey: string,
  radius: number = 25000,
  maxResults: number = 20
): Promise<GooglePlaceResult[]> {
  await rateLimiter.wait();

  const response = await fetch(TEXT_SEARCH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      locationBias: {
        circle: {
          center: { latitude, longitude },
          radius,
        },
      },
      maxResultCount: maxResults,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail = errorText;
    try {
      const parsed = JSON.parse(errorText);
      errorDetail = parsed.error?.message || parsed.error?.status || errorText;
    } catch {
      // use raw text
    }
    throw new Error(`Google Places Text Search API error ${response.status}: ${errorDetail}`);
  }

  const data = await response.json();
  return data.places || [];
}

/**
 * Fetch lawyers for specific practice areas using Text Search.
 * Makes one API call per practice area query (first query only to limit costs).
 * Returns places tagged with their search context (practice area slug).
 */
export async function fetchLawyersByPracticeArea(
  cityName: string,
  stateCode: string,
  latitude: number,
  longitude: number,
  apiKey: string,
  practiceAreaSlugs?: string[] // if not provided, fetch top practice areas
): Promise<{ places: GooglePlaceResultWithContext[]; apiCalls: number }> {
  const slugsToFetch = practiceAreaSlugs || Object.keys(PRACTICE_AREA_SEARCH_QUERIES);
  const seenIds = new Set<string>();
  const allPlaces: GooglePlaceResultWithContext[] = [];
  let apiCalls = 0;

  for (const slug of slugsToFetch) {
    const queries = PRACTICE_AREA_SEARCH_QUERIES[slug];
    if (!queries || queries.length === 0) continue;

    // Use the first (most common) query for each practice area
    const query = `${queries[0]} in ${cityName}, ${stateCode}`;

    try {
      const places = await fetchLawyersByTextSearch(query, latitude, longitude, apiKey);
      apiCalls++;

      for (const place of places) {
        if (!seenIds.has(place.id)) {
          seenIds.add(place.id);
          allPlaces.push({ ...place, _searchContext: slug });
        } else {
          // Place already exists — merge practice area context
          const existing = allPlaces.find(p => p.id === place.id);
          if (existing && existing._searchContext && !existing._searchContext.includes(slug)) {
            existing._searchContext += `,${slug}`;
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching practice area "${slug}" for ${cityName}:`, error);
      // Continue with other practice areas
    }
  }

  return { places: allPlaces, apiCalls };
}

// ==========================================
// MULTI-RADIUS FETCH (for better coverage)
// ==========================================

/**
 * Fetch lawyers at multiple radii to get comprehensive results.
 * Google Places maxes at 20 results per call. By searching at different
 * radii, we can capture more offices (deduped by Google Place ID).
 */
export async function fetchLawyersMultiRadius(
  latitude: number,
  longitude: number,
  apiKey: string,
  options?: {
    radii?: number[];
    maxResultsPerCall?: number;
  }
): Promise<GooglePlaceResult[]> {
  const radii = options?.radii || [5000, 15000, 25000, 40000];
  const maxResults = options?.maxResultsPerCall || 20;
  const seenIds = new Set<string>();
  const allPlaces: GooglePlaceResult[] = [];

  for (const radius of radii) {
    try {
      const places = await fetchNearbyLawyers(latitude, longitude, apiKey, radius, maxResults);

      for (const place of places) {
        if (!seenIds.has(place.id)) {
          seenIds.add(place.id);
          allPlaces.push(place);
        }
      }

      // If we got fewer results than max, larger radii won't help much
      if (places.length < maxResults && radius < radii[radii.length - 1]) {
        continue; // still try larger radius - different areas
      }
    } catch (error) {
      console.error(`Error fetching at radius ${radius}:`, error);
      // Continue with other radii
    }
  }

  return allPlaces;
}

// ==========================================
// OFFSET GRID SEARCH (for dense cities)
// ==========================================

/**
 * For dense cities, search a grid of points around the center
 * to maximize coverage beyond the 20-result limit per call.
 */
export async function fetchLawyersGridSearch(
  latitude: number,
  longitude: number,
  apiKey: string,
  options?: {
    gridOffset?: number;  // degrees offset for grid (default ~0.05 = ~5.5km)
    radius?: number;
    maxResultsPerCall?: number;
    maxApiCalls?: number;
  }
): Promise<GooglePlaceResult[]> {
  const offset = options?.gridOffset || 0.04;
  const radius = options?.radius || 15000;
  const maxResults = options?.maxResultsPerCall || 20;
  const maxCalls = options?.maxApiCalls || 5; // limit API calls per city

  // Center + 4 offset points (N, S, E, W)
  const searchPoints = [
    { lat: latitude, lng: longitude },                // Center
    { lat: latitude + offset, lng: longitude },       // North
    { lat: latitude - offset, lng: longitude },       // South
    { lat: latitude, lng: longitude + offset },       // East
    { lat: latitude, lng: longitude - offset },       // West
  ].slice(0, maxCalls);

  const seenIds = new Set<string>();
  const allPlaces: GooglePlaceResult[] = [];

  for (const point of searchPoints) {
    try {
      const places = await fetchNearbyLawyers(point.lat, point.lng, apiKey, radius, maxResults);

      for (const place of places) {
        if (!seenIds.has(place.id)) {
          seenIds.add(place.id);
          allPlaces.push(place);
        }
      }
    } catch (error) {
      console.error(`Error fetching grid point (${point.lat}, ${point.lng}):`, error);
    }
  }

  return allPlaces;
}

// ==========================================
// SMART FETCH (chooses strategy based on city)
// ==========================================

export type FetchStrategy = 'single' | 'multi-radius' | 'grid';

export async function fetchLawyersSmart(
  latitude: number,
  longitude: number,
  apiKey: string,
  population?: number,
  strategy?: FetchStrategy
): Promise<{ places: GooglePlaceResult[]; strategy: FetchStrategy; apiCalls: number }> {
  // Auto-select strategy based on population if not specified
  const resolvedStrategy = strategy || (
    (population && population > 1000000) ? 'grid' :
    (population && population > 300000) ? 'multi-radius' :
    'single'
  );

  let places: GooglePlaceResult[];
  let apiCalls = 0;

  switch (resolvedStrategy) {
    case 'grid':
      places = await fetchLawyersGridSearch(latitude, longitude, apiKey);
      apiCalls = 5;
      break;
    case 'multi-radius':
      places = await fetchLawyersMultiRadius(latitude, longitude, apiKey);
      apiCalls = 4;
      break;
    case 'single':
    default:
      places = await fetchNearbyLawyers(latitude, longitude, apiKey);
      apiCalls = 1;
      break;
  }

  return { places, strategy: resolvedStrategy, apiCalls };
}

// ==========================================
// COMPREHENSIVE FETCH (Nearby + Practice Area Text Searches)
// ==========================================

/**
 * Full fetch for a city: Nearby search + Text Search per practice area.
 * This gives us BOTH broad coverage AND specific practice area tagging.
 *
 * The Nearby search gives all lawyers in the area (tagged 'general' unless
 * their name contains keywords). The Text Searches give specific practice
 * area attorneys that Google recognizes as specialists.
 *
 * Results are deduped by Place ID. If an attorney appears in both a
 * Nearby search and a Text Search, the practice area from the Text Search
 * is added to their practiceAreas array.
 */
export async function fetchLawyersComprehensive(
  cityName: string,
  stateCode: string,
  latitude: number,
  longitude: number,
  apiKey: string,
  population?: number,
  options?: {
    practiceAreaSlugs?: string[];  // which practice areas to text-search (default: all)
    skipNearbySearch?: boolean;    // skip the generic Nearby search
    strategy?: FetchStrategy;
  }
): Promise<{
  places: GooglePlaceResultWithContext[];
  strategy: FetchStrategy;
  totalApiCalls: number;
  nearbyCount: number;
  textSearchCount: number;
}> {
  const seenIds = new Map<string, GooglePlaceResultWithContext>();
  let totalApiCalls = 0;
  let nearbyCount = 0;
  let textSearchCount = 0;
  let usedStrategy: FetchStrategy = 'single';

  // Step 1: Standard nearby search for broad coverage
  if (!options?.skipNearbySearch) {
    const { places, strategy, apiCalls } = await fetchLawyersSmart(
      latitude, longitude, apiKey, population, options?.strategy
    );
    totalApiCalls += apiCalls;
    usedStrategy = strategy;
    nearbyCount = places.length;

    for (const place of places) {
      seenIds.set(place.id, { ...place, _searchContext: undefined });
    }
  }

  // Step 2: Text Search per practice area for specific tagging
  const { places: textPlaces, apiCalls: textApiCalls } = await fetchLawyersByPracticeArea(
    cityName, stateCode, latitude, longitude, apiKey,
    options?.practiceAreaSlugs
  );
  totalApiCalls += textApiCalls;
  textSearchCount = textPlaces.length;

  for (const place of textPlaces) {
    const existing = seenIds.get(place.id);
    if (existing) {
      // Merge practice area context into existing entry
      const existingCtx = existing._searchContext || '';
      const newCtx = place._searchContext || '';
      const allContexts = Array.from(new Set([...existingCtx.split(','), ...newCtx.split(',')].filter(Boolean)));
      existing._searchContext = allContexts.join(',');
    } else {
      seenIds.set(place.id, place);
    }
  }

  return {
    places: Array.from(seenIds.values()),
    strategy: usedStrategy,
    totalApiCalls,
    nearbyCount,
    textSearchCount,
  };
}

// ==========================================
// PARSE GOOGLE PLACE TO ATTORNEY
// ==========================================

export function parseGooglePlace(place: GooglePlaceResultWithContext): ParsedAttorney {
  const displayName = place.displayName?.text || 'Unknown Office';
  const primaryTypeDisplay = place.primaryTypeDisplayName?.text || '';

  // Parse secondary hours (primary source)
  let parsedHours = parseGoogleSecondaryHours(place.regularSecondaryOpeningHours || []);

  // FALLBACK: If no secondary hours, derive from regular opening hours
  // Looking for evening (after 5pm) and weekend entries
  if (parsedHours.length === 0 && place.regularOpeningHours?.periods) {
    parsedHours = parseRegularOpeningHours(place.regularOpeningHours.periods);
  }

  // Build practice areas from multiple signals:
  // 1. Keywords in display name (existing logic)
  // 2. Keywords in primaryTypeDisplayName (e.g., "Tax attorney")
  // 3. Text search context (which practice area search found this result)
  const nameAreas = classifyPracticeAreas(displayName);
  const typeAreas = primaryTypeDisplay ? classifyPracticeAreas(primaryTypeDisplay) : [];
  
  // Parse text search context areas
  const contextAreas = place._searchContext
    ? place._searchContext.split(',').filter(Boolean)
    : [];

  // Merge all practice areas, remove duplicates, remove 'general' if we have specific areas
  const allAreas = Array.from(new Set([...nameAreas, ...typeAreas, ...contextAreas]));
  const specificAreas = allAreas.filter(a => a !== 'general');
  const practiceAreas = specificAreas.length > 0 ? specificAreas : ['general'];

  return {
    googlePlaceId: place.id,
    displayName,
    formattedAddress: place.formattedAddress || null,
    shortAddress: place.shortFormattedAddress || null,
    primaryType: place.primaryType || null,
    primaryTypeDisplayName: place.primaryTypeDisplayName?.text || null,
    latitude: place.location?.latitude || 0,
    longitude: place.location?.longitude || 0,
    googleMapsUri: place.googleMapsUri || null,
    websiteUri: place.websiteUri || null,

    // Payment options
    acceptsCreditCards: place.paymentOptions?.acceptsCreditCards ?? null,
    acceptsDebitCards: place.paymentOptions?.acceptsDebitCards ?? null,
    cashOnly: place.paymentOptions?.acceptsCashOnly ?? null,
    acceptsNfc: place.paymentOptions?.acceptsNfc ?? null,

    // Parking options
    freeParkingLot: place.parkingOptions?.freeParkingLot ?? null,
    paidParkingLot: place.parkingOptions?.paidParkingLot ?? null,
    freeStreetParking: place.parkingOptions?.freeStreetParking ?? null,
    valetParking: place.parkingOptions?.valetParking ?? null,
    freeGarageParking: place.parkingOptions?.freeGarageParking ?? null,
    paidGarageParking: place.parkingOptions?.paidGarageParking ?? null,

    // Accessibility options
    wheelchairAccessibleParking: place.accessibilityOptions?.wheelchairAccessibleParking ?? null,
    wheelchairAccessibleEntrance: place.accessibilityOptions?.wheelchairAccessibleEntrance ?? null,
    wheelchairAccessibleRestroom: place.accessibilityOptions?.wheelchairAccessibleRestroom ?? null,
    wheelchairAccessibleSeating: place.accessibilityOptions?.wheelchairAccessibleSeating ?? null,

    // Classified practice areas (enhanced with multiple signals)
    practiceAreas,

    // Parsed secondary hours
    secondaryHours: parsedHours.map((w) => ({
      hoursType: w.type,
      dayOfWeek: w.dayOfWeek,
      openHour: w.openHour,
      openMinute: w.openMinute,
      closeHour: w.closeHour,
      closeMinute: w.closeMinute,
    })),
  };
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

export function validateApiKey(apiKey: string | undefined): { valid: boolean; error?: string } {
  if (!apiKey) {
    return { valid: false, error: 'GOOGLE_PLACES_API_KEY environment variable is not set' };
  }
  if (apiKey === 'your-google-places-api-key') {
    return { valid: false, error: 'GOOGLE_PLACES_API_KEY is still set to placeholder value' };
  }
  if (apiKey.length < 20) {
    return { valid: false, error: 'GOOGLE_PLACES_API_KEY appears too short to be valid' };
  }
  return { valid: true };
}

/**
 * Quick test to verify the API key works by making a minimal request.
 */
export async function testApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify({
        includedTypes: ['lawyer'],
        locationRestriction: {
          circle: {
            center: { latitude: 40.7128, longitude: -74.006 },
            radius: 1000,
          },
        },
        maxResultCount: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let detail = errorText;
      try {
        const parsed = JSON.parse(errorText);
        detail = parsed.error?.message || parsed.error?.status || errorText;
      } catch {
        // use raw
      }
      return { valid: false, error: `API key test failed (${response.status}): ${detail}` };
    }

    return { valid: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { valid: false, error: `Network error testing API key: ${message}` };
  }
}
