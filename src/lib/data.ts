import prisma from './prisma';
import { checkAvailability, type DbSecondaryHour, type AvailabilityResult } from './attorneys';

export interface AttorneyWithHours {
  id: number;
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
  secondaryHours: DbSecondaryHour[];
  availability: AvailabilityResult;
}

export async function getAttorneysByCity(citySlug: string): Promise<AttorneyWithHours[]> {
  try {
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
    });

    if (!city) return [];

    const attorneys = await prisma.attorneyOffice.findMany({
      where: { cityId: city.id },
      include: { secondaryHours: true },
      orderBy: { displayName: 'asc' },
    });

    return attorneys.map((a) => ({
      ...a,
      secondaryHours: a.secondaryHours as DbSecondaryHour[],
      availability: checkAvailability(a.secondaryHours as DbSecondaryHour[]),
    }));
  } catch (error) {
    console.error('Database error in getAttorneysByCity:', error);
    return [];
  }
}

export async function getAttorneysByCityAndPracticeArea(
  citySlug: string,
  practiceAreaSlug: string
): Promise<AttorneyWithHours[]> {
  const all = await getAttorneysByCity(citySlug);
  // Only return attorneys that specifically match the requested practice area.
  // Do NOT include all "general" attorneys — that defeats the purpose of filtering.
  // An attorney tagged "general" only appears if no specific practice area was found.
  return all.filter(
    (a) => a.practiceAreas.includes(practiceAreaSlug)
  );
}

export async function getAttorneysByCityWeekend(citySlug: string): Promise<AttorneyWithHours[]> {
  const all = await getAttorneysByCity(citySlug);
  return all.filter((a) => a.availability.hasWeekendHours);
}

export async function getAttorneysByCityEmergency(
  citySlug: string,
  practiceAreaSlug: string
): Promise<AttorneyWithHours[]> {
  const all = await getAttorneysByCityAndPracticeArea(citySlug, practiceAreaSlug);
  return all.filter(
    (a) =>
      a.availability.hasEmergencyHours ||
      a.secondaryHours.some((h) => h.closeHour >= 22 || (h.openHour === 0 && h.closeHour === 23))
  );
}

export async function getCityFromDb(slug: string) {
  try {
    return await prisma.city.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function getAllCitySlugs(): Promise<string[]> {
  try {
    const cities = await prisma.city.findMany({ select: { slug: true } });
    return cities.map((c) => c.slug);
  } catch {
    return [];
  }
}

export async function getStateSummary(stateSlug: string) {
  try {
    const cities = await prisma.city.findMany({
      where: { stateSlug },
      include: {
        attorneyOffices: {
          include: { secondaryHours: true },
        },
      },
    });

    let totalAttorneys = 0;
    let eveningCount = 0;
    let weekendCount = 0;
    let emergencyCount = 0;

    const citySummaries = cities.map((city) => {
      const attorneys = city.attorneyOffices.map((a) => ({
        ...a,
        availability: checkAvailability(a.secondaryHours as DbSecondaryHour[]),
      }));

      const cityEvening = attorneys.filter((a) => a.availability.hasEveningHours).length;
      const cityWeekend = attorneys.filter((a) => a.availability.hasWeekendHours).length;
      const cityEmergency = attorneys.filter((a) => a.availability.hasEmergencyHours).length;

      totalAttorneys += attorneys.length;
      eveningCount += cityEvening;
      weekendCount += cityWeekend;
      emergencyCount += cityEmergency;

      return {
        city,
        totalAttorneys: attorneys.length,
        eveningCount: cityEvening,
        weekendCount: cityWeekend,
        emergencyCount: cityEmergency,
      };
    });

    return {
      cities: citySummaries,
      totalAttorneys,
      eveningCount,
      weekendCount,
      emergencyCount,
    };
  } catch (error) {
    console.error('Database error in getStateSummary:', error);
    return {
      cities: [],
      totalAttorneys: 0,
      eveningCount: 0,
      weekendCount: 0,
      emergencyCount: 0,
    };
  }
}

export function computeStats(attorneys: AttorneyWithHours[]) {
  const total = attorneys.length;
  const available = attorneys.filter((a) => a.availability.isAvailableNow);
  const evening = attorneys.filter((a) => a.availability.hasEveningHours);
  const weekend = attorneys.filter((a) => a.availability.hasWeekendHours);
  const emergency = attorneys.filter((a) => a.availability.hasEmergencyHours);

  return {
    total,
    availableNow: available,
    eveningCount: evening.length,
    weekendCount: weekend.length,
    emergencyCount: emergency.length,
  };
}
