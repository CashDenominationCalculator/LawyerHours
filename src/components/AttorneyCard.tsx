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

  // === COMPUTE DETAILED INSIGHTS ===

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
  const eveningPctOfList = listContext && listContext.totalInList > 0 ? Math.round((listContext.eveningCountInList / listContext.totalInList) * 100) : 0;
  const weekendPctOfList = listContext && listContext.totalInList > 0 ? Math.round((listContext.weekendCountInList / listContext.totalInList) * 100) : 0;

  // === BUILD "WHY CHOOSE THIS OFFICE" EDITORIAL ===
  const buildWhyChoose = (): string => {
    const parts: string[] = [];
    const strengths: string[] = [];

    if (availability.hasEveningHours && availability.hasWeekendHours) {
      strengths.push('both evening and weekend appointment availability');
    } else if (availability.hasEveningHours) {
      strengths.push('evening appointment availability for those who work during the day');
    } else if (availability.hasWeekendHours) {
      strengths.push('weekend appointment availability');
    }
    if (availability.hasEmergencyHours) strengths.push('emergency and late-night hours for urgent matters');
    if (hasFreeParking) strengths.push('complimentary parking on-site');
    if (isFullyAccessible) strengths.push('full wheelchair accessibility throughout the office');
    if (paymentItems.length >= 2 && !attorney.cashOnly) strengths.push('multiple payment methods including card and contactless options');
    if (displayAreas.length > 1) strengths.push(`experience across ${displayAreas.length} practice areas`);

    if (strengths.length >= 2) {
      parts.push(`${name} stands out among ${paDisplay ? paDisplay.toLowerCase() + ' practices' : 'law offices'} in ${location} for ${formatList(strengths)}.`);
    } else if (strengths.length === 1) {
      parts.push(`A key advantage of ${name} is ${strengths[0]}.`);
    }

    // Add context about how rare this is
    if (listContext && listContext.totalInList > 3) {
      const rarities: string[] = [];
      if (availability.hasEveningHours && eveningPctOfList < 30) {
        rarities.push(`only ${listContext.eveningCountInList} of ${listContext.totalInList} ${paDisplay.toLowerCase()} offices in ${location} (${eveningPctOfList}%) offer evening hours — making this a relatively uncommon feature`);
      }
      if (hasFreeParking && listContext.freeParkinCountInList <= Math.ceil(listContext.totalInList * 0.3)) {
        rarities.push(`free parking is available at just ${listContext.freeParkinCountInList} of ${listContext.totalInList} offices in this area`);
      }
      if (availability.hasEmergencyHours) {
        rarities.push(`emergency or late-night availability is offered at only ${listContext.emergencyCountInList} of ${listContext.totalInList} offices, which is critical for urgent situations like protective orders or emergency custody hearings`);
      }
      if (rarities.length > 0) {
        parts.push(`To put this in perspective: ${rarities[0]}.${rarities.length > 1 ? ` Additionally, ${rarities[1]}.` : ''}`);
      }
    }

    return parts.join(' ');
  };

  // === BUILD COMPREHENSIVE OFFICE OVERVIEW ===
  const buildOverview = (): string => {
    const parts: string[] = [];

    // Opening with location
    if (address && location && paDisplay) {
      parts.push(`${name} is a ${paDisplay.toLowerCase()} practice located at ${address} in ${location}.`);
    } else if (address) {
      parts.push(`${name} is located at ${address}${location ? ` in ${location}` : ''}.`);
    } else {
      parts.push(`${name} serves clients${location ? ` in the ${location} area` : ''}.`);
    }

    // Detailed hours
    if (availability.hasEveningHours && availability.hasWeekendHours) {
      const eveningStr = uniqueEveningDays.length > 0 && uniqueEveningDays.length <= 5
        ? ` on ${formatList(uniqueEveningDays)}`
        : '';
      const weekendStr = uniqueWeekendDays.length > 0
        ? formatList(uniqueWeekendDays)
        : 'weekends';

      parts.push(`This office offers both evening hours${eveningStr} and weekend consultations on ${weekendStr}, providing ${totalExtendedDays} days per week of extended availability. That totals approximately ${totalHoursPerWeek} hours of after-hours access each week — well above average for the area.`);

      if (latestClose >= 20) {
        parts.push(`The latest appointment window extends until ${formatHourDisplay(latestClose, latestCloseMinute)} on ${latestDay}, which makes it one of the later-closing offices among ${paDisplay.toLowerCase()} practices in ${location}.`);
      }
    } else if (availability.hasEveningHours) {
      parts.push(`Evening consultations are available${uniqueEveningDays.length > 0 && uniqueEveningDays.length <= 5 ? ` on ${formatList(uniqueEveningDays)}` : ''}, providing approximately ${totalHoursPerWeek} hours of extended weekly availability. This is a significant convenience for anyone who cannot step away from work during standard business hours.`);
      if (latestClose >= 20) {
        parts.push(`The office stays open as late as ${formatHourDisplay(latestClose, latestCloseMinute)} on ${latestDay}, giving you time to travel from work and still make a consultation.`);
      }
    } else if (availability.hasWeekendHours) {
      parts.push(`Weekend hours are available on ${formatList(uniqueWeekendDays)}, with approximately ${totalHoursPerWeek} hours of weekend access per week.`);
      if (earliestOpen < 24) {
        parts.push(`Weekend hours begin as early as ${formatHourDisplay(earliestOpen)} on ${earliestWeekendDay}. Early weekend slots tend to fill up quickly, so booking ahead by midweek is recommended.`);
      }
    } else if (attorney.secondaryHours.length > 0) {
      parts.push(`This office maintains extended hours beyond the standard 9-to-5 schedule across ${totalExtendedDays} day${totalExtendedDays !== 1 ? 's' : ''} per week, offering more flexibility than offices that close at 5 PM.`);
    }

    if (availability.hasEmergencyHours) {
      parts.push(`Emergency and late-night availability is also offered, which is an important option for time-sensitive situations such as protective orders, emergency custody hearings, or urgent filings with court deadlines.`);
    }

    return parts.join(' ');
  };

  // === BUILD "HOW THIS OFFICE COMPARES" ===
  const buildComparison = (): string | null => {
    if (!listContext || listContext.totalInList <= 2) return null;
    const parts: string[] = [];
    const advantages: string[] = [];
    const considerations: string[] = [];

    if (availability.hasEveningHours) {
      advantages.push(`evening hours (only ${eveningPctOfList}% of local ${paDisplay.toLowerCase()} offices offer this)`);
    }
    if (availability.hasWeekendHours) {
      advantages.push(`weekend availability (${weekendPctOfList}% offer this)`);
    }
    if (hasFreeParking) {
      advantages.push(`free parking (${listContext.freeParkinCountInList} of ${listContext.totalInList} offices)`);
    }
    if (isFullyAccessible) {
      advantages.push(`full wheelchair accessibility (entrance, parking, and restroom)`);
    }
    if (attorney.acceptsNfc) {
      advantages.push(`contactless/NFC payment — convenient for quick retainer transactions`);
    }

    if (!availability.hasEveningHours && listContext.eveningCountInList > 0) {
      considerations.push(`does not currently list evening hours (${listContext.eveningCountInList} other offices in the area do)`);
    }
    if (!availability.hasWeekendHours && listContext.weekendCountInList > 0) {
      considerations.push(`weekend hours are not listed (${listContext.weekendCountInList} other offices offer them)`);
    }

    if (advantages.length > 0) {
      parts.push(`Compared to the ${listContext.totalInList} ${paDisplay.toLowerCase()} offices we track in ${location}, ${name} offers: ${advantages.join('; ')}.`);
    }
    if (considerations.length > 0 && advantages.length > 0) {
      parts.push(`One thing to note: this office ${considerations[0]}.`);
    }

    return parts.length > 0 ? parts.join(' ') : null;
  };

  // === BUILD "WHAT TO EXPECT" SECTION ===
  const buildWhatToExpect = (): { heading: string; content: string }[] => {
    const sections: { heading: string; content: string }[] = [];

    // Parking
    if (parkingItems.length > 0) {
      if (hasFreeParking) {
        const freeTypes: string[] = [];
        if (attorney.freeParkingLot) freeTypes.push('a free parking lot directly on-site');
        if (attorney.freeGarageParking) freeTypes.push('free garage parking in the building');
        if (attorney.freeStreetParking) freeTypes.push('free street parking available nearby');
        sections.push({
          heading: 'Parking',
          content: `This office provides ${formatList(freeTypes)}. Parking cost will not be a concern when visiting, which is particularly helpful for evening appointments when downtown parking can be expensive.${attorney.paidParkingLot || attorney.paidGarageParking ? ' Paid parking options are also available as overflow.' : ''}`,
        });
      } else {
        sections.push({
          heading: 'Parking',
          content: `Parking options at this location include ${formatList(parkingItems)}. Plan to budget for parking costs, or consider using a rideshare service for evening or weekend visits. Check the office website for specific parking validation or discount information.`,
        });
      }
    }

    // Payment
    if (paymentItems.length > 0) {
      if (attorney.cashOnly) {
        sections.push({
          heading: 'Payment Methods',
          content: `This office accepts cash only. Be sure to bring cash or a money order for any consultation fees, retainer deposits, or filing cost advances. If this is a limitation for you, ${listContext && listContext.creditCardCountInList > 0 ? `${listContext.creditCardCountInList} other offices in ${location} accept credit cards.` : 'check other offices in the area for card-based payment options.'}`,
        });
      } else {
        const methods = [...paymentItems];
        sections.push({
          heading: 'Payment Methods',
          content: `${name} accepts ${formatList(methods)}. ${attorney.acceptsNfc ? 'Contactless and NFC payments are supported, meaning you can use Apple Pay, Google Pay, or tap-to-pay with your card — convenient for consultations where you may decide to retain the attorney on the spot.' : 'Credit and debit card acceptance means you can handle retainer payments or consultation fees without carrying cash.'}`,
        });
      }
    }

    // Accessibility
    if (accessItems.length > 0) {
      if (isFullyAccessible) {
        sections.push({
          heading: 'Accessibility',
          content: `This office is fully wheelchair accessible. Verified accessibility features include: ${formatList(accessItems)}. ${attorney.wheelchairAccessibleSeating ? 'The waiting area also provides accessible seating, ensuring comfort throughout your visit.' : ''} This comprehensive accessibility makes the office suitable for clients with mobility needs, parents with strollers, or anyone who benefits from barrier-free access.`,
        });
      } else {
        sections.push({
          heading: 'Accessibility',
          content: `Accessibility features at this office include ${formatList(accessItems)}. If you have specific accessibility requirements beyond what is listed here, contact the office directly before your visit to confirm accommodations.`,
        });
      }
    }

    // Scheduling advice
    if (availability.hasEveningHours || availability.hasWeekendHours) {
      const tips: string[] = [];
      if (uniqueEveningDays.length > 1) {
        tips.push(`Evening hours are available on ${formatList(uniqueEveningDays)}. If you have flexibility, ${uniqueEveningDays[uniqueEveningDays.length - 1]} evening typically has less demand than ${uniqueEveningDays[0]}, so you may find more open slots.`);
      } else if (uniqueEveningDays.length === 1) {
        tips.push(`Evening consultations are only available on ${uniqueEveningDays[0]}, so book early in the week to secure your preferred time.`);
      }
      if (uniqueWeekendDays.length > 0) {
        tips.push(`Weekend appointments on ${formatList(uniqueWeekendDays)}${earliestOpen < 24 ? ` start as early as ${formatHourDisplay(earliestOpen)}` : ''} — morning slots tend to fill up fastest. Call by Wednesday to get your preferred weekend time.`);
      }
      if (tips.length > 0) {
        sections.push({
          heading: 'Scheduling Tips',
          content: tips.join(' '),
        });
      }
    }

    return sections;
  };

  // === BUILD PRACTICE AREA NARRATIVE ===
  const buildPracticeAreaNarrative = (): string | null => {
    if (displayAreas.length <= 0) return null;

    if (displayAreas.length > 1) {
      const primaryArea = paDisplay || displayAreas[0];
      const otherAreas = displayAreas.filter(a => a.toLowerCase() !== primaryArea.toLowerCase());

      // Build specific overlap context
      let overlapContext = '';
      if (otherAreas.some(a => a.toLowerCase().includes('divorce'))) {
        overlapContext = 'For example, a family law case involving divorce may also require guidance on property division, spousal support calculations, or post-judgment modifications — having a firm that handles both under one roof simplifies the process.';
      } else if (otherAreas.some(a => a.toLowerCase().includes('real estate'))) {
        overlapContext = 'This cross-disciplinary experience is particularly valuable when family law matters involve real property — for instance, dividing a family home during divorce or navigating property liens during separation.';
      } else if (otherAreas.some(a => a.toLowerCase().includes('estate'))) {
        overlapContext = 'This overlap is useful when family law issues intersect with estate planning — such as updating wills and trusts after a divorce, or establishing guardianship alongside custody arrangements.';
      } else if (otherAreas.some(a => a.toLowerCase().includes('criminal'))) {
        overlapContext = 'Having criminal defense experience alongside family law can be critical in cases involving domestic violence allegations, restraining orders, or situations where criminal charges intersect with custody determinations.';
      } else if (otherAreas.some(a => a.toLowerCase().includes('immigration'))) {
        overlapContext = 'This combination is especially valuable for families dealing with immigration-related complications in custody cases, international child relocation disputes, or marriages involving visa status concerns.';
      } else if (otherAreas.some(a => a.toLowerCase().includes('bankruptcy'))) {
        overlapContext = 'This dual expertise matters when divorce proceedings coincide with financial distress — understanding how bankruptcy filings affect asset division, alimony, and child support is critical for protecting your interests.';
      } else {
        overlapContext = 'Having multi-area expertise under one roof can reduce the need to engage separate attorneys when your case involves overlapping legal issues.';
      }

      return `${name} handles cases across ${displayAreas.length} practice areas: ${formatList(displayAreas)}. ${overlapContext}`;
    }
    return `${name} focuses on ${displayAreas[0].toLowerCase()}, bringing concentrated expertise to this specific area of law.`;
  };

  const whyChooseText = buildWhyChoose();
  const overviewText = buildOverview();
  const comparisonText = buildComparison();
  const whatToExpect = buildWhatToExpect();
  const practiceAreaNarrative = buildPracticeAreaNarrative();

  return (
    <article
      className={`bg-white rounded-2xl shadow-sm border-2 transition-shadow hover:shadow-lg ${
        isAvailable ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-200'
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

      {/* ================================================================ */}
      {/* SECTION 1: HEADER — Name, Address, Status, CTAs                 */}
      {/* ================================================================ */}
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {rank && (
                <span className="text-sm font-bold text-white bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                  {rank}
                </span>
              )}
              {isAvailable && (
                <span className="relative flex h-3.5 w-3.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
                </span>
              )}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900" itemProp="name">{attorney.displayName}</h3>
            </div>

            {(attorney.shortAddress || attorney.formattedAddress) && (
              <p className="text-base text-gray-600 mb-3">
                {attorney.shortAddress || attorney.formattedAddress}
                {location && !address?.includes(location) && <span className="text-gray-500"> — {location}</span>}
              </p>
            )}

            {/* Available Now Badge */}
            {isAvailable && availability.currentWindow && (
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 text-base font-semibold px-4 py-2 rounded-full mb-4 border border-green-200">
                <span className="text-green-600">●</span>
                <span>Available Now</span>
                <span className="text-green-500">·</span>
                <span className="font-normal">{availability.currentWindow.type.replace(/_/g, ' ')}</span>
                <span className="text-green-500">·</span>
                <span className="font-normal">Closes at {availability.currentWindow.closesAt}</span>
                {availability.minutesUntilClose && (
                  <>
                    <span className="text-green-500">·</span>
                    <span className="font-bold text-green-700">{formatCountdown(availability.minutesUntilClose)} left</span>
                  </>
                )}
              </div>
            )}

            {/* Feature Tags */}
            <div className="flex flex-wrap gap-2">
              {availability.hasEveningHours && (
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-semibold">
                  Evening Hours
                </span>
              )}
              {availability.hasWeekendHours && (
                <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full font-semibold">
                  Weekend Hours
                </span>
              )}
              {availability.hasEmergencyHours && (
                <span className="text-sm bg-red-100 text-red-800 px-3 py-1.5 rounded-full font-semibold">
                  Emergency / Late Night
                </span>
              )}
              {hasFreeParking && (
                <span className="text-sm bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-semibold">
                  Free Parking
                </span>
              )}
              {isFullyAccessible && (
                <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full font-semibold">
                  Fully Accessible
                </span>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 shrink-0">
            {attorney.websiteUri && (
              <a
                href={attorney.websiteUri}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-bold transition-colors shadow-sm ${
                  isAvailable
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-900 hover:bg-black text-white'
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
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Get Directions
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SECTION 2: WHY CHOOSE THIS OFFICE                               */}
      {/* ================================================================ */}
      {whyChooseText && (
        <div className="px-6 sm:px-8 pb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="text-base font-bold text-amber-900 mb-2">Why Consider {name}</h4>
            <p className="text-base text-amber-800 leading-relaxed">
              {whyChooseText}
            </p>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 3: COMPREHENSIVE OFFICE OVERVIEW                        */}
      {/* ================================================================ */}
      <div className="px-6 sm:px-8 pb-6">
        <div className="bg-gray-50 rounded-xl p-5">
          <h4 className="text-base font-bold text-gray-800 mb-2">Office Overview</h4>
          <p className="text-base text-gray-700 leading-relaxed">
            {overviewText}
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SECTION 4: AT-A-GLANCE METRICS                                  */}
      {/* ================================================================ */}
      {attorney.secondaryHours.length > 0 && (
        <div className="px-6 sm:px-8 pb-6">
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Quick Reference — {name}</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200">
              <div className="p-4 text-center">
                <div className="text-sm font-semibold text-gray-600 mb-1">Extended Days</div>
                <div className="text-2xl font-bold text-gray-900">{totalExtendedDays}</div>
                <div className="text-sm text-gray-600">per week</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-sm font-semibold text-gray-600 mb-1">After-Hours</div>
                <div className="text-2xl font-bold text-blue-700">{totalHoursPerWeek}</div>
                <div className="text-sm text-gray-600">hours/week</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-sm font-semibold text-gray-600 mb-1">Latest Close</div>
                <div className="text-2xl font-bold text-indigo-700">{formatHourDisplay(latestClose, latestCloseMinute)}</div>
                <div className="text-sm text-gray-600">{latestDay}</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-sm font-semibold text-gray-600 mb-1">Verified Amenities</div>
                <div className="text-2xl font-bold text-green-700">{parkingItems.length + paymentItems.length + accessItems.length}</div>
                <div className="text-sm text-gray-600">features</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 5: DETAILED HOURS SCHEDULE                              */}
      {/* ================================================================ */}
      {attorney.secondaryHours.length > 0 && (
        <div className="px-6 sm:px-8 pb-6">
          <div className="border-2 border-gray-200 rounded-xl p-5">
            <h4 className="text-base font-bold text-gray-800 mb-4">
              Extended Hours Schedule — {totalExtendedDays} Day{totalExtendedDays !== 1 ? 's' : ''} Per Week
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {Array.from(scheduleByDay.entries())
                .sort(([a], [b]) => a - b)
                .map(([day, entries]) => (
                  <div key={day} className="flex items-baseline gap-3 py-1 border-b border-gray-100 last:border-0">
                    <span className="font-bold text-gray-800 w-24 shrink-0 text-sm">{DAY_NAMES[day]}</span>
                    <div className="text-sm text-gray-700">
                      {entries.map((e, i) => (
                        <span key={i}>
                          <span className="font-medium">{e.range}</span>
                          <span className="text-gray-500 ml-1">({e.type})</span>
                          {i < entries.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              {availability.hasEveningHours && availability.hasWeekendHours
                ? `${name} provides extended hours ${totalExtendedDays} days per week, covering both evening and weekend slots. This totals approximately ${totalHoursPerWeek} hours of after-hours availability each week — meaning you have significant flexibility to find a time that works outside standard business hours.`
                : availability.hasEveningHours
                  ? `Evening appointments are available ${uniqueEveningDays.length} weekday${uniqueEveningDays.length !== 1 ? 's' : ''} per week, providing ${totalHoursPerWeek} total hours of after-hours access. This is particularly useful if your work schedule prevents daytime legal consultations.`
                  : availability.hasWeekendHours
                    ? `Weekend availability on ${formatList(uniqueWeekendDays)} provides ${totalHoursPerWeek} hours of access beyond the traditional workweek. This is ideal for clients who cannot take time off during the week.`
                    : `Extended hours are available ${totalExtendedDays} day${totalExtendedDays !== 1 ? 's' : ''} per week, offering more scheduling options than offices that only keep standard business hours.`
              }
              {latestClose >= 21 && ` The latest appointment window extends to ${formatHourDisplay(latestClose, latestCloseMinute)} on ${latestDay}.`}
            </p>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 6: HOW THIS OFFICE COMPARES                             */}
      {/* ================================================================ */}
      {comparisonText && (
        <div className="px-6 sm:px-8 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h4 className="text-base font-bold text-blue-900 mb-2">
              How {name} Compares in {location}
            </h4>
            <p className="text-base text-blue-800 leading-relaxed">
              {comparisonText}
            </p>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 7: WHAT TO EXPECT — Parking, Payment, Accessibility     */}
      {/* ================================================================ */}
      {whatToExpect.length > 0 && (
        <div className="px-6 sm:px-8 pb-6">
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
              <h4 className="text-base font-bold text-gray-800">What to Expect When Visiting {name}</h4>
              <p className="text-sm text-gray-600 mt-1">Practical details verified via Google Places data to help you plan your visit.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {whatToExpect.map((section, i) => (
                <div key={i} className="px-5 py-4">
                  <h5 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">{section.heading}</h5>
                  <p className="text-base text-gray-700 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 8: PRACTICE AREAS                                       */}
      {/* ================================================================ */}
      {practiceAreaNarrative && (
        <div className="px-6 sm:px-8 pb-6">
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="text-base font-bold text-gray-800 mb-2">Practice Areas</h4>
            <p className="text-base text-gray-700 leading-relaxed mb-3">
              {practiceAreaNarrative}
            </p>
            <div className="flex flex-wrap gap-2">
              {displayAreas.map((area) => (
                <span key={area} className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-lg font-medium">
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 9: DATA SOURCE & VERIFICATION                           */}
      {/* ================================================================ */}
      <div className="px-6 sm:px-8 pb-6">
        <div className="bg-gray-100 rounded-xl px-5 py-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-700">Data source:</span> All hours, parking, payment, and accessibility information for {name} is sourced from the Google Places API and reflects data reported by the business itself.
            {attorney.websiteUri && <> Visit the <a href={attorney.websiteUri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">office website</a> to confirm current availability and schedule a consultation.</>}
            {rank && listContext && <span className="text-gray-500"> — Listed {ordinalSuffix(rank)} of {listContext.totalInList} {paDisplay ? paDisplay.toLowerCase() + ' ' : ''}attorneys tracked in {location}.</span>}
          </p>
        </div>
      </div>
    </article>
  );
}
