'use client';

import { DAY_NAMES } from '@/lib/constants';
import { formatTimeRange, formatCountdown, type DbSecondaryHour, type AvailabilityResult } from '@/lib/attorneys';
import PaymentIcons from './PaymentIcons';
import ParkingBadge from './ParkingBadge';
import AccessibilityBadges from './AccessibilityBadges';

interface AttorneyOfficeData {
  id: number;
  displayName: string;
  shortAddress?: string | null;
  formattedAddress?: string | null;
  googleMapsUri?: string | null;
  websiteUri?: string | null;
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

interface AttorneyCardProps {
  attorney: AttorneyOfficeData;
  availability: AvailabilityResult;
  variant?: 'available-now' | 'standard';
}

export default function AttorneyCard({ attorney, availability, variant = 'standard' }: AttorneyCardProps) {
  const isAvailable = variant === 'available-now';

  // Group hours by day for display
  const scheduleByDay = new Map<number, { type: string; range: string }[]>();
  for (const h of attorney.secondaryHours) {
    const entries = scheduleByDay.get(h.dayOfWeek) || [];
    entries.push({
      type: h.hoursType.replace(/_/g, ' '),
      range: formatTimeRange(h.openHour, h.openMinute, h.closeHour, h.closeMinute),
    });
    scheduleByDay.set(h.dayOfWeek, entries);
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-l-4 p-5 transition-shadow hover:shadow-md ${
        isAvailable ? 'border-l-green-500' : 'border-l-gray-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isAvailable && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{attorney.displayName}</h3>
          </div>

          {(attorney.shortAddress || attorney.formattedAddress) && (
            <p className="text-sm text-gray-500 mb-2">
              📍 {attorney.shortAddress || attorney.formattedAddress}
            </p>
          )}

          {/* Available Now Badge */}
          {isAvailable && availability.currentWindow && (
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full mb-3">
              <span>✅ Available Now</span>
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

          {/* Availability Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {availability.hasEveningHours && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                🌙 Evening Hours
              </span>
            )}
            {availability.hasWeekendHours && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
                📅 Weekend Hours
              </span>
            )}
            {availability.hasEmergencyHours && (
              <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full font-medium">
                🚨 Emergency Available
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
              {isAvailable ? '📞 Contact Now' : '🌐 Visit Site'}
            </a>
          )}
          {attorney.googleMapsUri && (
            <a
              href={attorney.googleMapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              📍 Directions
            </a>
          )}
        </div>
      </div>

      {/* Secondary Hours Schedule */}
      {attorney.secondaryHours.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Extended Hours Schedule
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {Array.from(scheduleByDay.entries())
              .sort(([a], [b]) => a - b)
              .map(([day, entries]) => (
                <div key={day} className="text-sm">
                  <span className="font-medium text-gray-700">{DAY_NAMES[day]}:</span>{' '}
                  {entries.map((e, i) => (
                    <span key={i} className="text-gray-600">
                      {e.type} {e.range}
                      {i < entries.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Info Row */}
      <div className="mt-3 flex flex-col gap-2">
        <PaymentIcons
          acceptsCreditCards={attorney.acceptsCreditCards}
          acceptsDebitCards={attorney.acceptsDebitCards}
          cashOnly={attorney.cashOnly}
          acceptsNfc={attorney.acceptsNfc}
        />
        <ParkingBadge
          freeParkingLot={attorney.freeParkingLot}
          paidParkingLot={attorney.paidParkingLot}
          freeStreetParking={attorney.freeStreetParking}
          valetParking={attorney.valetParking}
          freeGarageParking={attorney.freeGarageParking}
          paidGarageParking={attorney.paidGarageParking}
        />
        <AccessibilityBadges
          wheelchairAccessibleParking={attorney.wheelchairAccessibleParking}
          wheelchairAccessibleEntrance={attorney.wheelchairAccessibleEntrance}
          wheelchairAccessibleRestroom={attorney.wheelchairAccessibleRestroom}
          wheelchairAccessibleSeating={attorney.wheelchairAccessibleSeating}
        />
      </div>
    </div>
  );
}
