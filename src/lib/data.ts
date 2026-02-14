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

// ==========================================
// DETAILED STATS — UNIQUE FIRST-HAND DATA
// Mines Google Places data for insights no competitor has
// ==========================================

export interface NeighborhoodCluster {
  name: string;
  count: number;
  attorneys: string[];
  hasEvening: number;
  hasWeekend: number;
  hasParking: number;
  hasAccessibility: number;
}

export interface DayAvailability {
  dayName: string;
  dayIndex: number;
  eveningCount: number;
  latestCloseHour: number;
  latestCloseDisplay: string;
  attorneys: string[];
}

export interface DetailedStats {
  // Basic (from computeStats)
  total: number;
  eveningCount: number;
  weekendCount: number;
  emergencyCount: number;
  availableNow: AttorneyWithHours[];

  // Payment data — first-hand from Google Places
  acceptsCreditCards: number;
  acceptsDebitCards: number;
  acceptsNfc: number;
  cashOnly: number;
  paymentDataAvailable: number;

  // Parking data — first-hand from Google Places
  freeParkingLot: number;
  paidParkingLot: number;
  freeStreetParking: number;
  valetParking: number;
  freeGarageParking: number;
  paidGarageParking: number;
  anyFreeParking: number;
  parkingDataAvailable: number;

  // Accessibility data — first-hand from Google Places
  wheelchairEntrance: number;
  wheelchairParking: number;
  wheelchairRestroom: number;
  wheelchairSeating: number;
  fullyAccessible: number;
  accessibilityDataAvailable: number;

  // Hours analysis — computed from secondary hours
  dayByDayAvailability: DayAvailability[];
  busiestEveningDay: string;
  leastBusyEveningDay: string;
  latestAvailableHour: number;
  latestAvailableDisplay: string;
  latestAttorney: string | null;
  saturdayCount: number;
  sundayCount: number;
  earliestWeekendOpen: string | null;

  // Neighborhood clusters — from address parsing
  neighborhoods: NeighborhoodCluster[];

  // Attorneys with websites
  withWebsite: number;
  withGoogleMaps: number;

  // Unique insights for content
  freeConsultationFriendly: number; // evening + weekend = likely free consult targeting
  emergencyWithParking: number;
  weekendWithAccessibility: number;
}

const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatHour(hour: number, minute: number = 0): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return minute > 0 ? `${h}:${minute.toString().padStart(2, '0')} ${ampm}` : `${h} ${ampm}`;
}

function extractNeighborhood(address: string | null): string {
  if (!address) return 'Other';
  // Try to extract neighborhood/area from San Diego addresses
  const parts = address.split(',').map(p => p.trim());
  // Usually: "123 Main St, Neighborhood, San Diego, CA 92101"
  // or "123 Main St, San Diego, CA 92101"
  if (parts.length >= 3) {
    const area = parts[parts.length - 3]; // third from end is often neighborhood
    // Filter out state codes and zips
    if (area && !area.match(/^(CA|California|\d{5})/) && area !== 'United States' && area !== 'USA') {
      return area;
    }
  }
  // Fallback: extract zip code area
  const zipMatch = address.match(/\b(92\d{3})\b/);
  if (zipMatch) {
    const zipAreas: Record<string, string> = {
      '92101': 'Downtown',
      '92102': 'Golden Hill/Southeastern',
      '92103': 'Hillcrest/Mission Hills',
      '92104': 'North Park/Kensington',
      '92105': 'City Heights',
      '92106': 'Point Loma',
      '92107': 'Ocean Beach',
      '92108': 'Mission Valley',
      '92109': 'Pacific Beach',
      '92110': 'Old Town/Morena',
      '92111': 'Linda Vista/Clairemont',
      '92112': 'Downtown (PO)',
      '92113': 'Logan Heights/Barrio Logan',
      '92114': 'Encanto/Paradise Hills',
      '92115': 'College Area/Rolando',
      '92116': 'Normal Heights/University Heights',
      '92117': 'Clairemont',
      '92118': 'Coronado',
      '92119': 'San Carlos',
      '92120': 'Del Cerro/Allied Gardens',
      '92121': 'Sorrento Valley/Torrey Pines',
      '92122': 'University City',
      '92123': 'Serra Mesa/Kearny Mesa',
      '92124': 'Tierrasanta',
      '92126': 'Mira Mesa',
      '92127': 'Rancho Bernardo',
      '92128': 'Rancho Bernardo South',
      '92129': 'Rancho Penasquitos',
      '92130': 'Carmel Valley/Del Mar Heights',
      '92131': 'Scripps Ranch',
      '92134': 'Naval Base',
      '92139': 'Paradise Hills/National City',
      '92154': 'Otay Mesa/San Ysidro',
    };
    return zipAreas[zipMatch[1]] || `San Diego ${zipMatch[1]}`;
  }
  return 'San Diego';
}

export function computeDetailedStats(attorneys: AttorneyWithHours[]): DetailedStats {
  const total = attorneys.length;
  const available = attorneys.filter((a) => a.availability.isAvailableNow);
  const evening = attorneys.filter((a) => a.availability.hasEveningHours);
  const weekend = attorneys.filter((a) => a.availability.hasWeekendHours);
  const emergency = attorneys.filter((a) => a.availability.hasEmergencyHours);

  // Payment stats
  const acceptsCreditCards = attorneys.filter(a => a.acceptsCreditCards === true).length;
  const acceptsDebitCards = attorneys.filter(a => a.acceptsDebitCards === true).length;
  const acceptsNfc = attorneys.filter(a => a.acceptsNfc === true).length;
  const cashOnly = attorneys.filter(a => a.cashOnly === true).length;
  const paymentDataAvailable = attorneys.filter(a =>
    a.acceptsCreditCards !== null || a.acceptsDebitCards !== null || a.cashOnly !== null || a.acceptsNfc !== null
  ).length;

  // Parking stats
  const freeParkingLot = attorneys.filter(a => a.freeParkingLot === true).length;
  const paidParkingLot = attorneys.filter(a => a.paidParkingLot === true).length;
  const freeStreetParking = attorneys.filter(a => a.freeStreetParking === true).length;
  const valetParking = attorneys.filter(a => a.valetParking === true).length;
  const freeGarageParking = attorneys.filter(a => a.freeGarageParking === true).length;
  const paidGarageParking = attorneys.filter(a => a.paidGarageParking === true).length;
  const anyFreeParking = attorneys.filter(a =>
    a.freeParkingLot === true || a.freeStreetParking === true || a.freeGarageParking === true
  ).length;
  const parkingDataAvailable = attorneys.filter(a =>
    a.freeParkingLot !== null || a.paidParkingLot !== null || a.freeStreetParking !== null ||
    a.valetParking !== null || a.freeGarageParking !== null || a.paidGarageParking !== null
  ).length;

  // Accessibility stats
  const wheelchairEntrance = attorneys.filter(a => a.wheelchairAccessibleEntrance === true).length;
  const wheelchairParking = attorneys.filter(a => a.wheelchairAccessibleParking === true).length;
  const wheelchairRestroom = attorneys.filter(a => a.wheelchairAccessibleRestroom === true).length;
  const wheelchairSeating = attorneys.filter(a => a.wheelchairAccessibleSeating === true).length;
  const fullyAccessible = attorneys.filter(a =>
    a.wheelchairAccessibleEntrance === true && a.wheelchairAccessibleParking === true
  ).length;
  const accessibilityDataAvailable = attorneys.filter(a =>
    a.wheelchairAccessibleEntrance !== null || a.wheelchairAccessibleParking !== null
  ).length;

  // Day-by-day evening analysis
  const dayByDayAvailability: DayAvailability[] = [];
  for (let d = 0; d < 7; d++) {
    const dayAttorneys = attorneys.filter(a =>
      a.secondaryHours.some(h => h.dayOfWeek === d && h.closeHour >= 17)
    );
    let latestClose = 0;
    for (const a of dayAttorneys) {
      for (const h of a.secondaryHours) {
        if (h.dayOfWeek === d && h.closeHour > latestClose) {
          latestClose = h.closeHour;
        }
      }
    }
    dayByDayAvailability.push({
      dayName: DAY_NAMES_FULL[d],
      dayIndex: d,
      eveningCount: dayAttorneys.length,
      latestCloseHour: latestClose,
      latestCloseDisplay: latestClose > 0 ? formatHour(latestClose) : 'N/A',
      attorneys: dayAttorneys.map(a => a.displayName),
    });
  }

  // Find busiest/least busy evening days (weekdays only)
  const weekdayAvail = dayByDayAvailability.filter(d => d.dayIndex >= 1 && d.dayIndex <= 5);
  const sortedWeekdays = [...weekdayAvail].sort((a, b) => b.eveningCount - a.eveningCount);
  const busiestEveningDay = sortedWeekdays[0]?.dayName || 'N/A';
  const leastBusyEveningDay = sortedWeekdays[sortedWeekdays.length - 1]?.dayName || 'N/A';

  // Latest available hour across all attorneys
  let latestAvailableHour = 0;
  let latestAttorney: string | null = null;
  for (const a of attorneys) {
    for (const h of a.secondaryHours) {
      if (h.closeHour > latestAvailableHour || (h.closeHour === 0 && h.openHour < h.closeHour)) {
        latestAvailableHour = h.closeHour;
        latestAttorney = a.displayName;
      }
    }
  }

  // Saturday/Sunday specifics
  const saturdayCount = attorneys.filter(a =>
    a.secondaryHours.some(h => h.dayOfWeek === 6)
  ).length;
  const sundayCount = attorneys.filter(a =>
    a.secondaryHours.some(h => h.dayOfWeek === 0)
  ).length;

  // Earliest weekend open
  let earliestWeekendOpen: number | null = null;
  for (const a of attorneys) {
    for (const h of a.secondaryHours) {
      if ((h.dayOfWeek === 0 || h.dayOfWeek === 6)) {
        if (earliestWeekendOpen === null || h.openHour < earliestWeekendOpen) {
          earliestWeekendOpen = h.openHour;
        }
      }
    }
  }

  // Neighborhood clusters
  const neighborhoodMap = new Map<string, {
    count: number;
    attorneys: string[];
    hasEvening: number;
    hasWeekend: number;
    hasParking: number;
    hasAccessibility: number;
  }>();

  for (const a of attorneys) {
    const hood = extractNeighborhood(a.formattedAddress || a.shortAddress);
    const existing = neighborhoodMap.get(hood) || {
      count: 0, attorneys: [], hasEvening: 0, hasWeekend: 0, hasParking: 0, hasAccessibility: 0,
    };
    existing.count++;
    existing.attorneys.push(a.displayName);
    if (a.availability.hasEveningHours) existing.hasEvening++;
    if (a.availability.hasWeekendHours) existing.hasWeekend++;
    if (a.freeParkingLot === true || a.freeStreetParking === true || a.freeGarageParking === true) existing.hasParking++;
    if (a.wheelchairAccessibleEntrance === true) existing.hasAccessibility++;
    neighborhoodMap.set(hood, existing);
  }

  const neighborhoods: NeighborhoodCluster[] = Array.from(neighborhoodMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Cross-reference insights
  const emergencyWithParking = attorneys.filter(a =>
    a.availability.hasEmergencyHours &&
    (a.freeParkingLot === true || a.freeStreetParking === true || a.freeGarageParking === true)
  ).length;

  const weekendWithAccessibility = attorneys.filter(a =>
    a.availability.hasWeekendHours && a.wheelchairAccessibleEntrance === true
  ).length;

  return {
    total,
    eveningCount: evening.length,
    weekendCount: weekend.length,
    emergencyCount: emergency.length,
    availableNow: available,

    acceptsCreditCards,
    acceptsDebitCards,
    acceptsNfc,
    cashOnly,
    paymentDataAvailable,

    freeParkingLot,
    paidParkingLot,
    freeStreetParking,
    valetParking,
    freeGarageParking,
    paidGarageParking,
    anyFreeParking,
    parkingDataAvailable,

    wheelchairEntrance,
    wheelchairParking,
    wheelchairRestroom,
    wheelchairSeating,
    fullyAccessible,
    accessibilityDataAvailable,

    dayByDayAvailability,
    busiestEveningDay,
    leastBusyEveningDay,
    latestAvailableHour,
    latestAvailableDisplay: latestAvailableHour > 0 ? formatHour(latestAvailableHour) : 'N/A',
    latestAttorney,
    saturdayCount,
    sundayCount,
    earliestWeekendOpen: earliestWeekendOpen !== null ? formatHour(earliestWeekendOpen) : null,

    neighborhoods,

    withWebsite: attorneys.filter(a => a.websiteUri).length,
    withGoogleMaps: attorneys.filter(a => a.googleMapsUri).length,

    freeConsultationFriendly: attorneys.filter(a =>
      a.availability.hasEveningHours || a.availability.hasWeekendHours
    ).length,
    emergencyWithParking,
    weekendWithAccessibility,
  };
}
