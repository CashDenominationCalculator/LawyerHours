import type { DetailedStats } from '@/lib/data';

interface Props {
  stats: DetailedStats;
  cityName: string;
  practiceArea: string;
  stateCode: string;
}

export default function DataInsightsSection({ stats, cityName, practiceArea, stateCode }: Props) {
  if (stats.total === 0) return null;

  const eveningPct = Math.round((stats.eveningCount / stats.total) * 100);
  const weekendPct = Math.round((stats.weekendCount / stats.total) * 100);

  return (
    <section className="mb-12">
      <div className="border-t border-gray-200 pt-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base font-bold text-blue-700 uppercase tracking-wider">Data Analysis</span>
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">Verified via Google Places</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {cityName} {practiceArea} Attorney Availability — By the Numbers
        </h2>
        <p className="text-base text-gray-600 mb-8">
          We analyzed real-time data from {stats.total} {practiceArea.toLowerCase()} offices in {cityName}, {stateCode} to surface insights you won&apos;t find in a standard directory listing.
        </p>

        {/* ============ HOURS HEATMAP ============ */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            📊 When Are {cityName} {practiceArea} Attorneys Actually Available?
          </h3>
          <p className="text-base text-gray-600 mb-5">Extended hours availability by day of week, based on Google Places verified hours.</p>

          <div className="grid grid-cols-7 gap-2 mb-6">
            {stats.dayByDayAvailability.map((day) => {
              const intensity = stats.total > 0 ? day.eveningCount / stats.total : 0;
              const bgColor = day.eveningCount === 0
                ? 'bg-gray-100'
                : intensity > 0.5
                  ? 'bg-green-500 text-white'
                  : intensity > 0.3
                    ? 'bg-green-300'
                    : intensity > 0.1
                      ? 'bg-green-200'
                      : 'bg-green-100';
              return (
                <div key={day.dayIndex} className={`${bgColor} rounded-lg p-3 text-center`}>
                  <div className="text-xs font-semibold">{day.dayName.slice(0, 3)}</div>
                  <div className="text-lg font-bold">{day.eveningCount}</div>
                  <div className="text-xs opacity-75">offices</div>
                  {day.latestCloseHour > 0 && (
                    <div className="text-xs mt-1 opacity-75">til {day.latestCloseDisplay}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-base text-gray-700 space-y-3">
            <p>
              <strong>Key finding:</strong> {eveningPct}% of {practiceArea.toLowerCase()} attorneys in {cityName} offer extended evening hours.
              {stats.busiestEveningDay !== stats.leastBusyEveningDay && (
                <> <strong>{stats.busiestEveningDay}</strong> is the best day to schedule an evening consultation, while <strong>{stats.leastBusyEveningDay}</strong> has fewer options.</>
              )}
            </p>
            {stats.saturdayCount > 0 && (
              <p>
                <strong>{stats.saturdayCount}</strong> office{stats.saturdayCount !== 1 ? 's' : ''} open on Saturdays
                {stats.sundayCount > 0 ? ` and ${stats.sundayCount} on Sundays` : ', though no offices report Sunday hours'}.
                {stats.earliestWeekendOpen && <> Weekend hours start as early as <strong>{stats.earliestWeekendOpen}</strong>.</>}
              </p>
            )}
            {stats.latestAttorney && stats.latestAvailableHour >= 20 && (
              <p>
                The latest-available office stays open until <strong>{stats.latestAvailableDisplay}</strong>.
              </p>
            )}
          </div>
        </div>

        {/* ============ THREE-COLUMN INSIGHTS ============ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* PARKING */}
          {stats.parkingDataAvailable > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🅿️</span> Parking Availability
              </h3>
              <div className="space-y-3 text-base">
                {stats.anyFreeParking > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Free parking available</span>
                    <span className="font-bold text-green-700">{stats.anyFreeParking} offices</span>
                  </div>
                )}
                {stats.freeParkingLot > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 pl-3">↳ Free lot</span>
                    <span className="font-bold">{stats.freeParkingLot}</span>
                  </div>
                )}
                {stats.freeStreetParking > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 pl-3">↳ Free street</span>
                    <span className="font-medium">{stats.freeStreetParking}</span>
                  </div>
                )}
                {stats.freeGarageParking > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 pl-3">↳ Free garage</span>
                    <span className="font-medium">{stats.freeGarageParking}</span>
                  </div>
                )}
                {stats.paidParkingLot > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Paid parking lot</span>
                    <span className="font-medium">{stats.paidParkingLot}</span>
                  </div>
                )}
                {stats.valetParking > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Valet parking</span>
                    <span className="font-medium">{stats.valetParking}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100 text-sm text-gray-500">
                  Based on {stats.parkingDataAvailable} offices with reported parking data
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT */}
          {stats.paymentDataAvailable > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>💳</span> Payment Methods Accepted
              </h3>
              <div className="space-y-3 text-base">
                {stats.acceptsCreditCards > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Credit cards</span>
                    <span className="font-bold text-blue-700">{stats.acceptsCreditCards} offices</span>
                  </div>
                )}
                {stats.acceptsDebitCards > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Debit cards</span>
                    <span className="font-medium">{stats.acceptsDebitCards}</span>
                  </div>
                )}
                {stats.acceptsNfc > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Contactless / NFC</span>
                    <span className="font-medium">{stats.acceptsNfc}</span>
                  </div>
                )}
                {stats.cashOnly > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cash only</span>
                    <span className="font-medium text-amber-700">{stats.cashOnly}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100 text-sm text-gray-500">
                  Based on {stats.paymentDataAvailable} offices with reported payment data
                </div>
              </div>
            </div>
          )}

          {/* ACCESSIBILITY */}
          {stats.accessibilityDataAvailable > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>♿</span> Wheelchair Accessibility
              </h3>
              <div className="space-y-3 text-base">
                {stats.wheelchairEntrance > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Accessible entrance</span>
                    <span className="font-bold text-purple-700">{stats.wheelchairEntrance} offices</span>
                  </div>
                )}
                {stats.wheelchairParking > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Accessible parking</span>
                    <span className="font-medium">{stats.wheelchairParking}</span>
                  </div>
                )}
                {stats.wheelchairRestroom > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Accessible restroom</span>
                    <span className="font-medium">{stats.wheelchairRestroom}</span>
                  </div>
                )}
                {stats.wheelchairSeating > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Accessible seating</span>
                    <span className="font-medium">{stats.wheelchairSeating}</span>
                  </div>
                )}
                {stats.fullyAccessible > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-gray-700 font-medium">Fully accessible (entrance + parking)</span>
                    <span className="font-bold text-green-700">{stats.fullyAccessible}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100 text-sm text-gray-500">
                  Based on {stats.accessibilityDataAvailable} offices with reported accessibility data
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============ NEIGHBORHOOD MAP ============ */}
        {stats.neighborhoods.length > 1 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              📍 Where in {cityName} Are {practiceArea} Attorneys Concentrated?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Office distribution by neighborhood, with evening/weekend availability and amenities at a glance.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-3 font-semibold text-gray-700">Neighborhood</th>
                    <th className="p-3 font-semibold text-gray-700 text-center">Offices</th>
                    <th className="p-3 font-semibold text-gray-700 text-center">🌙 Evening</th>
                    <th className="p-3 font-semibold text-gray-700 text-center">📅 Weekend</th>
                    <th className="p-3 font-semibold text-gray-700 text-center">🅿️ Free Parking</th>
                    <th className="p-3 font-semibold text-gray-700 text-center">♿ Accessible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.neighborhoods.map((hood) => (
                    <tr key={hood.name} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{hood.name}</td>
                      <td className="p-3 text-center font-bold">{hood.count}</td>
                      <td className="p-3 text-center">
                        {hood.hasEvening > 0 ? (
                          <span className="text-blue-700 font-medium">{hood.hasEvening}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {hood.hasWeekend > 0 ? (
                          <span className="text-purple-700 font-medium">{hood.hasWeekend}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {hood.hasParking > 0 ? (
                          <span className="text-green-700 font-medium">{hood.hasParking}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {hood.hasAccessibility > 0 ? (
                          <span className="text-purple-700 font-medium">{hood.hasAccessibility}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Neighborhood data extracted from verified Google Places addresses. Offices may serve clients from surrounding areas.
            </p>
          </div>
        )}

        {/* ============ CROSS-REFERENCE INSIGHTS ============ */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            💡 Practical Takeaways for Finding a {practiceArea} Attorney in {cityName}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-gray-700">
            <div className="bg-white/70 rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-1">Best day for an evening consult</p>
              <p>{stats.busiestEveningDay} has the most offices with extended hours ({
                stats.dayByDayAvailability.find(d => d.dayName === stats.busiestEveningDay)?.eveningCount || 0
              } of {stats.total}).</p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-1">Weekend availability</p>
              <p>{weekendPct}% of offices offer weekend hours — {stats.saturdayCount} on Saturday{stats.sundayCount > 0 ? `, ${stats.sundayCount} on Sunday` : ''}.</p>
            </div>
            {stats.anyFreeParking > 0 && (
              <div className="bg-white/70 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Free parking</p>
                <p>{stats.anyFreeParking} of {stats.total} offices offer some form of free parking — helpful for evening visits when meters may be enforced.</p>
              </div>
            )}
            {stats.fullyAccessible > 0 && (
              <div className="bg-white/70 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Full accessibility</p>
                <p>{stats.fullyAccessible} office{stats.fullyAccessible !== 1 ? 's have' : ' has'} both wheelchair-accessible entrance and parking.</p>
              </div>
            )}
            {stats.acceptsCreditCards > 0 && (
              <div className="bg-white/70 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Payment flexibility</p>
                <p>{stats.acceptsCreditCards} office{stats.acceptsCreditCards !== 1 ? 's accept' : ' accepts'} credit cards.
                {stats.acceptsNfc > 0 && <> {stats.acceptsNfc} support contactless payment.</>}</p>
              </div>
            )}
            <div className="bg-white/70 rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-1">Online presence</p>
              <p>{stats.withWebsite} of {stats.total} offices have websites — check for intake forms you can fill out before your evening or weekend visit.</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Data sourced from Google Places API. Parking, payment, accessibility, and hours information is self-reported by businesses and verified by Google.
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
        </p>
      </div>
    </section>
  );
}
