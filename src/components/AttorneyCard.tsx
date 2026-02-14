'use client';

import { DAY_NAMES, PRACTICE_AREAS } from '@/lib/constants';
import { formatTimeRange, formatCountdown, type DbSecondaryHour, type AvailabilityResult } from '@/lib/attorneys';

interface AttorneyOfficeData {
  id: number;
  displayName: string;
  shortAddress?: string | null;
  formattedAddress?: string | null;
  googleMapsUri?: string | null;
  websiteUri?: string | null;
  latitude?: number;
  longitude?: number;
  acceptsCreditCards?: boolean | null;
  acceptsDebitCards?: boolean | null;
  cashOnly?: boolean | null;
  acceptsNfc?: boolean | null;
  freeParkingLot?: boolean | null;
  paidParkingLot?: boolean | null;
  freeStreetParking?: boolean | null;
  valetParking?: boolean | null;
  freeGarageParking?: boolean | null;
  paidGarageParking?: boolean | null;
  wheelchairAccessibleParking?: boolean | null;
  wheelchairAccessibleEntrance?: boolean | null;
  wheelchairAccessibleRestroom?: boolean | null;
  wheelchairAccessibleSeating?: boolean | null;
  practiceAreas: string[];
  secondaryHours: DbSecondaryHour[];
}

interface AttorneyListContext {
  totalInList: number;
  eveningCountInList: number;
  weekendCountInList: number;
  emergencyCountInList: number;
  freeParkinCountInList: number;
  creditCardCountInList: number;
  accessibleCountInList: number;
}

interface AttorneyCardProps {
  attorney: AttorneyOfficeData;
  availability: AvailabilityResult;
  variant?: 'available-now' | 'standard';
  cityName?: string;
  practiceAreaSlug?: string;
  practiceAreaName?: string;
  rank?: number;
  listContext?: AttorneyListContext;
}

const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatHourDisplay(hour: number, minute: number = 0): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return minute > 0 ? `${h}:${minute.toString().padStart(2, '0')} ${ampm}` : `${h} ${ampm}`;
}

function getPracticeAreaDisplayName(slug: string): string {
  const pa = PRACTICE_AREAS.find(p => p.slug === slug);
  return pa?.displayName || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function AttorneyCard({ attorney, availability, variant = 'standard', cityName, practiceAreaSlug, practiceAreaName, rank, listContext }: AttorneyCardProps) {
  const isAvailable = variant === 'available-now';

  // Group hours by day for display
  const scheduleByDay = new Map<number, { type: string; range: string; openHour: number; closeHour: number; closeMinute: number }[]>();
  for (const h of attorney.secondaryHours) {
    const entries = scheduleByDay.get(h.dayOfWeek) || [];
    entries.push({
      type: h.hoursType.replace(/_/g, ' '),
      range: formatTimeRange(h.openHour, h.openMinute, h.closeHour, h.closeMinute),
      openHour: h.openHour,
      closeHour: h.closeHour,
      closeMinute: h.closeMinute,
    });
    scheduleByDay.set(h.dayOfWeek, entries);
  }

  // === COMPUTE DETAILED INSIGHTS FOR THIS ATTORNEY ===

  const eveningDays = attorney.secondaryHours
    .filter(h => h.closeHour >= 17 && h.dayOfWeek >= 1 && h.dayOfWeek <= 5)
    .map(h => DAY_NAMES_FULL[h.dayOfWeek]);
  const uniqueEveningDays = Array.from(new Set(eveningDays));

  const weekendDays = attorney.secondaryHours
    .filter(h => h.dayOfWeek === 0 || h.dayOfWeek === 6)
    .map(h => DAY_NAMES_FULL[h.dayOfWeek]);
  const uniqueWeekendDays = Array.from(new Set(weekendDays));

  let latestClose = 0;
  let latestDay = '';
  let latestCloseMinute = 0;
  for (const h of attorney.secondaryHours) {
    if (h.closeHour > latestClose || (h.closeHour === latestClose && h.closeMinute > latestCloseMinute)) {
      latestClose = h.closeHour;
      latestCloseMinute = h.closeMinute;
      latestDay = DAY_NAMES_FULL[h.dayOfWeek];
    }
  }

  let earliestOpen = 24;
  let earliestWeekendDay = '';
  for (const h of attorney.secondaryHours) {
    if ((h.dayOfWeek === 0 || h.dayOfWeek === 6) && h.openHour < earliestOpen) {
      earliestOpen = h.openHour;
      earliestWeekendDay = DAY_NAMES_FULL[h.dayOfWeek];
    }
  }

  // Total hours per week calculation
  let totalMinutesPerWeek = 0;
  for (const h of attorney.secondaryHours) {
    const open = h.openHour * 60 + h.openMinute;
    const close = h.closeHour * 60 + h.closeMinute;
    if (close > open) totalMinutesPerWeek += (close - open);
  }
  const totalHoursPerWeek = Math.round(totalMinutesPerWeek / 60 * 10) / 10;

  // Parking data
  const parkingItems: string[] = [];
  if (attorney.freeParkingLot) parkingItems.push('a free parking lot');
  if (attorney.freeGarageParking) parkingItems.push('free garage parking');
  if (attorney.freeStreetParking) parkingItems.push('free street parking nearby');
  if (attorney.paidParkingLot) parkingItems.push('a paid parking lot');
  if (attorney.paidGarageParking) parkingItems.push('paid garage parking');
  if (attorney.valetParking) parkingItems.push('valet parking');
  const hasFreeParking = !!(attorney.freeParkingLot || attorney.freeGarageParking || attorney.freeStreetParking);

  // Payment data
  const paymentItems: string[] = [];
  if (attorney.acceptsCreditCards) paymentItems.push('credit cards');
  if (attorney.acceptsDebitCards) paymentItems.push('debit cards');
  if (attorney.acceptsNfc) paymentItems.push('contactless/NFC payments');
  if (attorney.cashOnly) paymentItems.push('cash only');

  // Accessibility data
  const accessItems: string[] = [];
  if (attorney.wheelchairAccessibleEntrance) accessItems.push('wheelchair-accessible entrance');
  if (attorney.wheelchairAccessibleParking) accessItems.push('accessible parking');
  if (attorney.wheelchairAccessibleRestroom) accessItems.push('accessible restroom');
  if (attorney.wheelchairAccessibleSeating) accessItems.push('accessible seating');
  const isFullyAccessible = accessItems.length >= 3;

  // Practice areas
  const specificAreas = attorney.practiceAreas.filter(a => a !== 'general');
  const displayAreas = specificAreas.map(getPracticeAreaDisplayName);

  const totalExtendedDays = scheduleByDay.size;
  const name = attorney.displayName;
  const address = attorney.shortAddress || attorney.formattedAddress;
  const location = cityName || '';
  const paDisplay = practiceAreaName || (practiceAreaSlug ? getPracticeAreaDisplayName(practiceAreaSlug) : '');

  // === BUILD "BEST FOR" RECOMMENDATION ===
  const bestForItems: string[] = [];
  if (availability.hasEveningHours && availability.hasWeekendHours) {
    bestForItems.push('clients who need maximum scheduling flexibility');
  } else if (availability.hasEveningHours) {
    bestForItems.push('working professionals who can only meet after business hours');
  } else if (availability.hasWeekendHours) {
    bestForItems.push('clients who prefer weekend appointments');
  }
  if (availability.hasEmergencyHours) {
    bestForItems.push('urgent or time-sensitive legal matters');
  }
  if (hasFreeParking) {
    bestForItems.push('clients who need hassle-free parking');
  }
  if (isFullyAccessible) {
    bestForItems.push('clients with mobility or accessibility needs');
  }
  if (paymentItems.length >= 2 && !attorney.cashOnly) {
    bestForItems.push('clients who prefer flexible payment options');
  }

  // === BUILD RICH NARRATIVE SUMMARY ===
  const buildSummary = (): string => {
    const parts: string[] = [];

    // Opening sentence with location context
    if (address && location) {
      parts.push(`${name} is a ${paDisplay ? paDisplay.toLowerCase() + ' practice' : 'law office'} located at ${address} in ${location}.`);
    } else if (address) {
      parts.push(`${name} is located at ${address}.`);
    } else {
      parts.push(`${name} serves clients${location ? ` in ${location}` : ''}.`);
    }

    // Detailed hours narrative with specific data
    if (availability.hasEveningHours && availability.hasWeekendHours) {
      const eveningStr = uniqueEveningDays.length > 0 && uniqueEveningDays.length <= 5
        ? ` on ${formatList(uniqueEveningDays)}`
        : '';
      const weekendStr = uniqueWeekendDays.length > 0
        ? `weekend consultations on ${formatList(uniqueWeekendDays)}`
        : 'weekend consultations';

      parts.push(`This office provides both evening hours${eveningStr} and ${weekendStr}, offering ${totalExtendedDays} days per week of extended availability — a total of approximately ${totalHoursPerWeek} extended hours weekly.`);

      if (latestClose >= 20) {
        parts.push(`The latest appointment window runs until ${formatHourDisplay(latestClose, latestCloseMinute)} on ${latestDay}, making it one of the later-closing offices in the area.`);
      }
    } else if (availability.hasEveningHours) {
      parts.push(`Evening hours are available${uniqueEveningDays.length > 0 && uniqueEveningDays.length <= 5 ? ` on ${formatList(uniqueEveningDays)}` : ''}, providing approximately ${totalHoursPerWeek} hours of extended weekly availability.`);
      if (latestClose >= 20) {
        parts.push(`The office stays open as late as ${formatHourDisplay(latestClose, latestCloseMinute)} on ${latestDay}.`);
      }
    } else if (availability.hasWeekendHours) {
      parts.push(`Weekend hours are available on ${formatList(uniqueWeekendDays)}.`);
      if (earliestOpen < 24) {
        parts.push(`Weekend hours begin as early as ${formatHourDisplay(earliestOpen)} on ${earliestWeekendDay}, with approximately ${totalHoursPerWeek} hours of extended availability each week.`);
      }
    } else if (attorney.secondaryHours.length > 0) {
      parts.push(`This office maintains extended hours beyond the standard 9-to-5 schedule across ${totalExtendedDays} day${totalExtendedDays !== 1 ? 's' : ''} per week.`);
    }

    if (availability.hasEmergencyHours) {
      parts.push('Emergency and late-night availability is offered for urgent legal matters — an important option for time-sensitive situations like protective orders or emergency custody hearings.');
    }

    return parts.join(' ');
  };

  // === BUILD VISIT PLANNING NARRATIVE ===
  const buildVisitPlan = (): string[] => {
    const tips: string[] = [];

    // Parking tip
    if (hasFreeParking) {
      const freeTypes: string[] = [];
      if (attorney.freeParkingLot) freeTypes.push('a free parking lot on-site');
      if (attorney.freeGarageParking) freeTypes.push('free garage parking');
      if (attorney.freeStreetParking) freeTypes.push('free street parking nearby');
      tips.push(`Parking: This office offers ${formatList(freeTypes)}, so parking cost is not a concern when visiting.`);
    } else if (parkingItems.length > 0) {
      tips.push(`Parking: Available options include ${formatList(parkingItems)}. Budget for parking costs or consider ride-sharing.`);
    }

    // Payment tip
    if (paymentItems.length > 0) {
      if (attorney.cashOnly) {
        tips.push(`Payment: This office accepts cash only. Make sure to bring cash or a money order for any fees or retainer payments.`);
      } else if (attorney.acceptsNfc) {
        tips.push(`Payment: Accepts ${formatList(paymentItems)}, including tap-to-pay — convenient for consultations where you may decide to retain on the spot.`);
      } else {
        tips.push(`Payment: Accepts ${formatList(paymentItems)}.`);
      }
    }

    // Accessibility
    if (isFullyAccessible) {
      tips.push(`Accessibility: Fully wheelchair accessible — including entrance, parking${attorney.wheelchairAccessibleRestroom ? ', restroom' : ''}${attorney.wheelchairAccessibleSeating ? ', and waiting area seating' : ''}.`);
    } else if (accessItems.length > 0) {
      tips.push(`Accessibility: Features include ${formatList(accessItems)}. Contact the office for specific accommodation needs.`);
    }

    // Best appointment time
    if (uniqueEveningDays.length > 0) {
      const busiest = uniqueEveningDays[0]; // First evening day is often busiest
      if (uniqueEveningDays.length > 1) {
        tips.push(`Scheduling tip: Evening hours are available on ${formatList(uniqueEveningDays)}. For the best selection of time slots, try booking on ${uniqueEveningDays[uniqueEveningDays.length - 1]} — typically less demand than ${busiest}.`);
      } else {
        tips.push(`Scheduling tip: Evening consultations are available on ${busiest}. Book early in the week to secure your preferred time slot.`);
      }
    }

    if (uniqueWeekendDays.length > 0 && earliestOpen < 24) {
      tips.push(`Weekend tip: Opens at ${formatHourDisplay(earliestOpen)} on ${earliestWeekendDay}. Morning weekend slots tend to fill up fastest — consider calling by Wednesday to schedule.`);
    }

    return tips;
  };

  // === BUILD COMPARISON CONTEXT ===
  const buildComparisonBadges = (): { label: string; color: string }[] => {
    const badges: { label: string; color: string }[] = [];
    if (!listContext) return badges;

    // Standout features compared to the list
    if (availability.hasEveningHours && availability.hasWeekendHours) {
      const bothCount = listContext.eveningCountInList > 0 && listContext.weekendCountInList > 0
        ? Math.min(listContext.eveningCountInList, listContext.weekendCountInList) : 0;
      if (bothCount > 0 && bothCount <= Math.ceil(listContext.totalInList * 0.3)) {
        badges.push({ label: 'Top 30% — Evening + Weekend', color: 'bg-amber-50 text-amber-700 border-amber-200' });
      }
    }

    if (totalExtendedDays >= 5) {
      badges.push({ label: `${totalExtendedDays}-day extended schedule`, color: 'bg-blue-50 text-blue-700 border-blue-200' });
    }

    if (latestClose >= 21) {
      badges.push({ label: `Open until ${formatHourDisplay(latestClose)}`, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' });
    }

    if (hasFreeParking && listContext.freeParkinCountInList > 0 && listContext.freeParkinCountInList <= Math.ceil(listContext.totalInList * 0.4)) {
      badges.push({ label: 'Free parking available', color: 'bg-green-50 text-green-700 border-green-200' });
    }

    if (isFullyAccessible) {
      badges.push({ label: 'Fully wheelchair accessible', color: 'bg-purple-50 text-purple-700 border-purple-200' });
    }

    if (attorney.acceptsNfc) {
      badges.push({ label: 'Contactless payment', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' });
    }

    return badges.slice(0, 4); // Max 4 badges
  };

  const summaryText = buildSummary();
  const visitTips = buildVisitPlan();
  const comparisonBadges = buildComparisonBadges();

  return (
    <article
      className={`bg-white rounded-xl shadow-sm border p-5 sm:p-6 transition-shadow hover:shadow-md ${
        isAvailable ? 'border-green-300 ring-1 ring-green-100' : 'border-gray-200'
      }`}
      itemScope
      itemType="https://schema.org/LegalService"
    >
      {/* Hidden schema markup */}
      <meta itemProp="name" content={attorney.displayName} />
      {attorney.formattedAddress && <meta itemProp="address" content={attorney.formattedAddress} />}
      {attorney.websiteUri && <meta itemProp="url" content={attorney.websiteUri} />}
      {attorney.latitude && (
        <span itemProp="geo" itemScope itemType="https://schema.org/GeoCoordinates">
          <meta itemProp="latitude" content={String(attorney.latitude)} />
          <meta itemProp="longitude" content={String(attorney.longitude)} />
        </span>
      )}
      {paymentItems.length > 0 && <meta itemProp="paymentAccepted" content={paymentItems.join(', ')} />}
      {accessItems.length > 0 && (
        <span itemProp="amenityFeature" itemScope itemType="https://schema.org/LocationFeatureSpecification">
          <meta itemProp="name" content="Wheelchair Accessible" />
          <meta itemProp="value" content="True" />
        </span>
      )}

      {/* === HEADER === */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {rank && (
              <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                {rank}
              </span>
            )}
            {isAvailable && (
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-900" itemProp="name">{attorney.displayName}</h3>
          </div>

          {(attorney.shortAddress || attorney.formattedAddress) && (
            <p className="text-sm text-gray-500 mb-2">
              {attorney.shortAddress || attorney.formattedAddress}
            </p>
          )}

          {/* Available Now Badge */}
          {isAvailable && availability.currentWindow && (
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full mb-3">
              <span>Available Now</span>
              <span>·</span>
              <span>{availability.currentWindow.type.replace(/_/g, ' ')}</span>
              <span>·</span>
              <span>Closes at {availability.currentWindow.closesAt}</span>
              {availability.minutesUntilClose && (
                <>
                  <span>·</span>
                  <span className="font-bold">{formatCountdown(availability.minutesUntilClose)} left</span>
                </>
              )}
            </div>
          )}

          {/* Availability + Practice Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {availability.hasEveningHours && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                Evening Hours
              </span>
            )}
            {availability.hasWeekendHours && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                Weekend Hours
              </span>
            )}
            {availability.hasEmergencyHours && (
              <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium">
                Emergency / Late Night
              </span>
            )}
            {hasFreeParking && (
              <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                Free Parking
              </span>
            )}
            {accessItems.length >= 2 && (
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                Wheelchair Accessible
              </span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col gap-2 shrink-0">
          {attorney.websiteUri && (
            <a
              href={attorney.websiteUri}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isAvailable
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-800 hover:bg-gray-900 text-white'
              }`}
            >
              {isAvailable ? 'Contact Now' : 'Visit Website'}
            </a>
          )}
          {attorney.googleMapsUri && (
            <a
              href={attorney.googleMapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Get Directions
            </a>
          )}
        </div>
      </div>

      {/* === COMPARISON DISTINCTION BADGES === */}
      {comparisonBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {comparisonBadges.map((badge, i) => (
            <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${badge.color}`}>
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* === "BEST FOR" RECOMMENDATION === */}
      {bestForItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-amber-900">
            <span className="font-semibold">Best for:</span> {formatList(bestForItems)}.
          </p>
        </div>
      )}

      {/* === RICH DESCRIPTIVE SUMMARY === */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          {summaryText}
        </p>
      </div>

      {/* === AT-A-GLANCE DATA CARD === */}
      {attorney.secondaryHours.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
            {/* Hours */}
            <div className="p-3 text-center">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Extended Days</div>
              <div className="text-xl font-bold text-gray-900">{totalExtendedDays}</div>
              <div className="text-xs text-gray-500">per week</div>
            </div>
            {/* Weekly hours */}
            <div className="p-3 text-center">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Extended Hrs</div>
              <div className="text-xl font-bold text-blue-700">{totalHoursPerWeek}</div>
              <div className="text-xs text-gray-500">hours/week</div>
            </div>
            {/* Latest close */}
            <div className="p-3 text-center">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Latest Close</div>
              <div className="text-xl font-bold text-indigo-700">{formatHourDisplay(latestClose, latestCloseMinute)}</div>
              <div className="text-xs text-gray-500">{latestDay}</div>
            </div>
            {/* Amenities count */}
            <div className="p-3 text-center">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Amenities</div>
              <div className="text-xl font-bold text-green-700">{parkingItems.length + paymentItems.length + accessItems.length}</div>
              <div className="text-xs text-gray-500">verified</div>
            </div>
          </div>
        </div>
      )}

      {/* === DETAILED HOURS SCHEDULE === */}
      {attorney.secondaryHours.length > 0 && (
        <div className="border border-gray-100 rounded-lg p-4 mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Extended Hours Schedule ({totalExtendedDays} day{totalExtendedDays !== 1 ? 's' : ''} per week)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {Array.from(scheduleByDay.entries())
              .sort(([a], [b]) => a - b)
              .map(([day, entries]) => (
                <div key={day} className="text-sm flex items-baseline gap-2">
                  <span className="font-semibold text-gray-800 w-20 shrink-0">{DAY_NAMES[day]}</span>
                  <div className="text-gray-600">
                    {entries.map((e, i) => (
                      <span key={i}>
                        {e.range}
                        <span className="text-gray-400 text-xs ml-1">({e.type})</span>
                        {i < entries.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Hours insight sentence */}
          <p className="text-xs text-gray-400 mt-3 italic">
            {availability.hasEveningHours && availability.hasWeekendHours
              ? `Extended hours available ${totalExtendedDays} days a week, including evenings and weekends — approximately ${totalHoursPerWeek} hours of after-hours availability per week.`
              : availability.hasEveningHours
                ? `Evening appointments available ${uniqueEveningDays.length} weekday${uniqueEveningDays.length !== 1 ? 's' : ''} per week (${totalHoursPerWeek} hrs total).`
                : availability.hasWeekendHours
                  ? `Weekend availability on ${formatList(uniqueWeekendDays)} (${totalHoursPerWeek} hours total).`
                  : `Extended hours available ${totalExtendedDays} day${totalExtendedDays !== 1 ? 's' : ''} per week.`
            }
            {latestClose >= 21 && ` Latest availability until ${formatHourDisplay(latestClose, latestCloseMinute)} on ${latestDay}.`}
          </p>
        </div>
      )}

      {/* === OFFICE AMENITIES & DETAILS (3-column grid) === */}
      {(parkingItems.length > 0 || paymentItems.length > 0 || accessItems.length > 0) && (
        <div className="border border-gray-100 rounded-lg p-4 mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Office Details — Verified via Google Places
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Parking */}
            {parkingItems.length > 0 && (
              <div className="text-sm">
                <span className="font-semibold text-gray-700 block mb-1">Parking</span>
                <ul className="space-y-0.5">
                  {attorney.freeParkingLot && <li className="text-green-700 text-xs">Free parking lot</li>}
                  {attorney.freeGarageParking && <li className="text-green-700 text-xs">Free garage parking</li>}
                  {attorney.freeStreetParking && <li className="text-blue-700 text-xs">Free street parking</li>}
                  {attorney.paidParkingLot && <li className="text-amber-700 text-xs">Paid parking lot</li>}
                  {attorney.paidGarageParking && <li className="text-amber-700 text-xs">Paid garage parking</li>}
                  {attorney.valetParking && <li className="text-purple-700 text-xs">Valet available</li>}
                </ul>
              </div>
            )}

            {/* Payment */}
            {paymentItems.length > 0 && (
              <div className="text-sm">
                <span className="font-semibold text-gray-700 block mb-1">Payment</span>
                <ul className="space-y-0.5">
                  {attorney.acceptsCreditCards && <li className="text-xs text-gray-600">Credit cards accepted</li>}
                  {attorney.acceptsDebitCards && <li className="text-xs text-gray-600">Debit cards accepted</li>}
                  {attorney.acceptsNfc && <li className="text-xs text-gray-600">Contactless / NFC</li>}
                  {attorney.cashOnly && <li className="text-xs text-amber-700">Cash only</li>}
                </ul>
              </div>
            )}

            {/* Accessibility */}
            {accessItems.length > 0 && (
              <div className="text-sm">
                <span className="font-semibold text-gray-700 block mb-1">Accessibility</span>
                <ul className="space-y-0.5">
                  {attorney.wheelchairAccessibleEntrance && <li className="text-xs text-gray-600">Accessible entrance</li>}
                  {attorney.wheelchairAccessibleParking && <li className="text-xs text-gray-600">Accessible parking</li>}
                  {attorney.wheelchairAccessibleRestroom && <li className="text-xs text-gray-600">Accessible restroom</li>}
                  {attorney.wheelchairAccessibleSeating && <li className="text-xs text-gray-600">Accessible seating</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === VISIT PLANNING TIPS === */}
      {visitTips.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
          <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
            Planning Your Visit to {name}
          </h4>
          <ul className="space-y-2">
            {visitTips.map((tip, i) => (
              <li key={i} className="text-xs text-blue-900 leading-relaxed">
                <strong>{tip.split(':')[0]}:</strong>{tip.substring(tip.indexOf(':') + 1)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* === PRACTICE AREAS SERVED === */}
      {displayAreas.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1.5">
            <span className="font-semibold text-gray-600">Practice areas served:</span>{' '}
            {displayAreas.length > 1
              ? `${name} handles cases across ${displayAreas.length} practice areas, including ${formatList(displayAreas)}. This breadth can be helpful if your family law matter involves overlapping issues such as ${
                  displayAreas.includes('Real Estate') ? 'property division' :
                  displayAreas.includes('Estate Planning') ? 'estate planning' :
                  displayAreas.includes('Criminal Defense') ? 'domestic violence defense' :
                  displayAreas.includes('Immigration') ? 'immigration-related family matters' :
                  'related legal concerns'
                }.`
              : `Focused on ${displayAreas[0].toLowerCase()}.`
            }
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {displayAreas.map((area) => (
              <span key={area} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* === DATA SOURCE NOTE === */}
      <div className="mt-3 text-xs text-gray-300">
        Hours, parking, payment, and accessibility data verified via Google Places API.
        {attorney.websiteUri && ' Visit website to confirm current availability and schedule a consultation.'}
        {rank && listContext && ` Listed ${ordinalSuffix(rank)} of ${listContext.totalInList} ${paDisplay ? paDisplay.toLowerCase() + ' ' : ''}attorneys in ${location}.`}
      </div>
    </article>
  );
}
