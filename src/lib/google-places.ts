import { classifyPracticeAreas, parseGoogleSecondaryHours } from './attorneys';

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

export interface GooglePlaceResult {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  primaryType?: string;
  primaryTypeDisplayName?: { text: string; languageCode?: string };
  location?: { latitude: number; longitude: number };
  regularOpeningHours?: any;
  regularSecondaryOpeningHours?: any[];
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

export async function fetchNearbyLawyers(
  latitude: number,
  longitude: number,
  apiKey: string,
  radius: number = 25000,
  maxResults: number = 20
): Promise<GooglePlaceResult[]> {
  const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
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
    throw new Error(`Google Places API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.places || [];
}

export function parseGooglePlace(place: GooglePlaceResult): ParsedAttorney {
  const displayName = place.displayName?.text || 'Unknown Office';
  const parsedHours = parseGoogleSecondaryHours(place.regularSecondaryOpeningHours || []);

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

    // Classified practice areas
    practiceAreas: classifyPracticeAreas(displayName),

    // Parsed secondary hours
    secondaryHours: parsedHours.map(w => ({
      hoursType: w.type,
      dayOfWeek: w.dayOfWeek,
      openHour: w.openHour,
      openMinute: w.openMinute,
      closeHour: w.closeHour,
      closeMinute: w.closeMinute,
    })),
  };
}
