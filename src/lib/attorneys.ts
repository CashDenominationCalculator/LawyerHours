import { PRACTICE_AREAS, DAY_NAMES } from './constants';

// ==========================================
// PRACTICE AREA CLASSIFICATION
// ==========================================
export function classifyPracticeAreas(displayName: string): string[] {
  const name = displayName.toLowerCase();
  const matched: string[] = [];

  for (const area of PRACTICE_AREAS) {
    for (const keyword of area.keywords) {
      if (name.includes(keyword.toLowerCase())) {
        matched.push(area.slug);
        break;
      }
    }
  }

  return matched.length > 0 ? Array.from(new Set(matched)) : ['general'];
}

// ==========================================
// SECONDARY HOURS TYPES
// ==========================================
export interface SecondaryHourWindow {
  type: string;
  dayOfWeek: number;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  label: string;
}

export interface AvailabilityResult {
  windows: SecondaryHourWindow[];
  isAvailableNow: boolean;
  currentWindow: { type: string; closesAt: string } | null;
  hasEveningHours: boolean;
  hasWeekendHours: boolean;
  hasEmergencyHours: boolean;
  minutesUntilClose: number | null;
}

// ==========================================
// PARSE GOOGLE SECONDARY HOURS
// ==========================================
export function parseGoogleSecondaryHours(secondaryHours: any[]): SecondaryHourWindow[] {
  if (!secondaryHours || !Array.isArray(secondaryHours)) return [];

  const windows: SecondaryHourWindow[] = [];

  for (const entry of secondaryHours) {
    const hoursType = entry.secondaryHoursType || entry.hoursType || 'CONSULTATION';
    const periods = entry.periods || [];

    for (const period of periods) {
      const openDay = period.open?.day ?? 0;
      const openHour = period.open?.hour ?? 0;
      const openMinute = period.open?.minute ?? 0;
      const closeDay = period.close?.day ?? openDay;
      const closeHour = period.close?.hour ?? 23;
      const closeMinute = period.close?.minute ?? 59;

      // If open and close are on same day
      if (openDay === closeDay) {
        windows.push({
          type: hoursType,
          dayOfWeek: openDay,
          openHour,
          openMinute,
          closeHour,
          closeMinute,
          label: categorizeWindow(hoursType, openDay, openHour, closeHour),
        });
      } else {
        // Spans multiple days - create entries for each day
        let currentDay = openDay;
        while (currentDay !== closeDay) {
          const isFirstDay = currentDay === openDay;
          windows.push({
            type: hoursType,
            dayOfWeek: currentDay,
            openHour: isFirstDay ? openHour : 0,
            openMinute: isFirstDay ? openMinute : 0,
            closeHour: 23,
            closeMinute: 59,
            label: categorizeWindow(hoursType, currentDay, isFirstDay ? openHour : 0, 23),
          });
          currentDay = (currentDay + 1) % 7;
        }
        // Add the last day
        windows.push({
          type: hoursType,
          dayOfWeek: closeDay,
          openHour: 0,
          openMinute: 0,
          closeHour,
          closeMinute,
          label: categorizeWindow(hoursType, closeDay, 0, closeHour),
        });
      }
    }
  }

  return windows;
}

function categorizeWindow(type: string, day: number, openHour: number, closeHour: number): string {
  const typeName = type.replace(/_/g, ' ').toLowerCase();

  if (closeHour >= 22 || (openHour <= 6 && closeHour >= 22)) {
    return `Late Night ${capitalize(typeName)}`;
  }
  if (day === 0 || day === 6) {
    return `Weekend ${capitalize(typeName)}`;
  }
  if (openHour >= 17) {
    return `Evening ${capitalize(typeName)}`;
  }
  return capitalize(typeName);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ==========================================
// CHECK AVAILABILITY
// ==========================================
export interface DbSecondaryHour {
  id: number;
  hoursType: string;
  dayOfWeek: number;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
}

export function checkAvailability(hours: DbSecondaryHour[], now?: Date): AvailabilityResult {
  const currentTime = now || new Date();
  const currentDay = currentTime.getDay(); // 0=Sunday
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  let isAvailableNow = false;
  let currentWindow: { type: string; closesAt: string } | null = null;
  let minutesUntilClose: number | null = null;
  let hasEveningHours = false;
  let hasWeekendHours = false;
  let hasEmergencyHours = false;

  const windows: SecondaryHourWindow[] = hours.map(h => ({
    type: h.hoursType,
    dayOfWeek: h.dayOfWeek,
    openHour: h.openHour,
    openMinute: h.openMinute,
    closeHour: h.closeHour,
    closeMinute: h.closeMinute,
    label: categorizeWindow(h.hoursType, h.dayOfWeek, h.openHour, h.closeHour),
  }));

  for (const h of hours) {
    // Check evening hours (opens at or after 5pm on weekdays)
    if (h.openHour >= 17 && h.dayOfWeek >= 1 && h.dayOfWeek <= 5) {
      hasEveningHours = true;
    }
    // Also count as evening if closes after 6pm on weekdays
    if (h.closeHour >= 18 && h.dayOfWeek >= 1 && h.dayOfWeek <= 5) {
      hasEveningHours = true;
    }

    // Check weekend hours
    if (h.dayOfWeek === 0 || h.dayOfWeek === 6) {
      hasWeekendHours = true;
    }

    // Check emergency hours (late night or 24/7 type)
    if (h.closeHour >= 22 || h.hoursType.toUpperCase().includes('EMERGENCY') ||
        (h.openHour === 0 && h.closeHour === 23 && h.closeMinute === 59)) {
      hasEmergencyHours = true;
    }

    // Check if available right now
    if (h.dayOfWeek === currentDay) {
      const openTotal = h.openHour * 60 + h.openMinute;
      const closeTotal = h.closeHour * 60 + h.closeMinute;

      if (currentTotalMinutes >= openTotal && currentTotalMinutes < closeTotal) {
        isAvailableNow = true;
        const remaining = closeTotal - currentTotalMinutes;
        if (minutesUntilClose === null || remaining < minutesUntilClose) {
          minutesUntilClose = remaining;
          currentWindow = {
            type: h.hoursType,
            closesAt: formatTime(h.closeHour, h.closeMinute),
          };
        }
      }
    }
  }

  return {
    windows,
    isAvailableNow,
    currentWindow,
    hasEveningHours,
    hasWeekendHours,
    hasEmergencyHours,
    minutesUntilClose,
  };
}

// ==========================================
// FORMATTING HELPERS
// ==========================================
export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute > 0 ? `:${minute.toString().padStart(2, '0')}` : '';
  return `${displayHour}${displayMinute}${period}`;
}

export function formatTimeRange(openHour: number, openMinute: number, closeHour: number, closeMinute: number): string {
  return `${formatTime(openHour, openMinute)} – ${formatTime(closeHour, closeMinute)}`;
}

export function formatSchedule(hours: DbSecondaryHour[]): Map<number, { type: string; range: string }[]> {
  const schedule = new Map<number, { type: string; range: string }[]>();

  for (const h of hours) {
    const entries = schedule.get(h.dayOfWeek) || [];
    entries.push({
      type: h.hoursType.replace(/_/g, ' '),
      range: formatTimeRange(h.openHour, h.openMinute, h.closeHour, h.closeMinute),
    });
    schedule.set(h.dayOfWeek, entries);
  }

  return schedule;
}

export function formatCountdown(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function getScheduleDisplayLines(hours: DbSecondaryHour[]): string[] {
  const schedule = formatSchedule(hours);
  const lines: string[] = [];

  for (let day = 0; day < 7; day++) {
    const entries = schedule.get(day);
    if (entries && entries.length > 0) {
      for (const entry of entries) {
        lines.push(`${DAY_NAMES[day]}: ${entry.type} ${entry.range}`);
      }
    }
  }

  return lines;
}
