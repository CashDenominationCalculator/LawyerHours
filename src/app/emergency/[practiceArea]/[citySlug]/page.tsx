import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCityBySlug, getPracticeAreaBySlug, EMERGENCY_PRACTICE_AREAS, SITE_URL } from '@/lib/constants';
import { getAttorneysByCityEmergency, computeStats } from '@/lib/data';
import { formatTimeRange } from '@/lib/attorneys';

interface PageProps {
  params: { practiceArea: string; citySlug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const city = getCityBySlug(params.citySlug);
  const pa = getPracticeAreaBySlug(params.practiceArea);
  if (!city || !pa) return {};

  const title = `Emergency ${pa.displayName} Attorneys in ${city.name}, ${city.stateCode} — Available Now`;
  const description = `Need emergency ${pa.displayName.toLowerCase()} help in ${city.name}? Find attorneys available late night and weekends with click-to-call numbers.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/emergency/${pa.slug}/${city.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/emergency/${pa.slug}/${city.slug}` },
  };
}

export const dynamic = 'force-dynamic';

export default async function EmergencyPage({ params }: PageProps) {
  if (!EMERGENCY_PRACTICE_AREAS.includes(params.practiceArea)) notFound();

  const city = getCityBySlug(params.citySlug);
  const pa = getPracticeAreaBySlug(params.practiceArea);
  if (!city || !pa) notFound();

  const attorneys = await getAttorneysByCityEmergency(params.citySlug, pa.slug);
  const stats = computeStats(attorneys);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Emergency Header */}
      <div className="bg-red-700 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-4xl mb-3">🚨</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Emergency {pa.displayName} Help in {city.name}
          </h1>
          <p className="text-red-100 text-lg">
            {attorneys.length} attorney{attorneys.length !== 1 ? 's' : ''} with late-night or emergency availability
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">›</span>
          <Link href={`/${city.slug}`} className="hover:text-white">{city.name}</Link>
          <span className="mx-2">›</span>
          <span className="text-white">Emergency {pa.displayName}</span>
        </nav>

        {/* Available Now Highlight */}
        {stats.availableNow.length > 0 && (
          <div className="bg-green-800 rounded-xl p-6 mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-400"></span>
              </span>
              <span className="text-xl font-bold text-green-100">
                {stats.availableNow.length} Available RIGHT NOW
              </span>
            </div>
          </div>
        )}

        {/* Attorney Cards - Minimal Emergency Style */}
        <div className="space-y-4">
          {attorneys.map((attorney) => {
            const isNow = attorney.availability.isAvailableNow;
            return (
              <div
                key={attorney.id}
                className={`rounded-xl p-6 ${
                  isNow ? 'bg-green-900/50 border-2 border-green-500' : 'bg-gray-800 border border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isNow && (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                      )}
                      <h2 className="text-xl font-bold">{attorney.displayName}</h2>
                    </div>
                    {attorney.shortAddress && (
                      <p className="text-gray-400 text-sm mb-3">📍 {attorney.shortAddress}</p>
                    )}
                    {/* Show relevant emergency hours */}
                    <div className="space-y-1">
                      {attorney.secondaryHours
                        .filter((h) => h.closeHour >= 20 || h.dayOfWeek === 0 || h.dayOfWeek === 6)
                        .map((h, i) => (
                          <div key={i} className="text-sm text-gray-300">
                            <span className="text-gray-500">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][h.dayOfWeek]}:
                            </span>{' '}
                            {formatTimeRange(h.openHour, h.openMinute, h.closeHour, h.closeMinute)}
                            <span className="text-gray-500 ml-1">({h.hoursType.replace(/_/g, ' ')})</span>
                          </div>
                        ))}
                    </div>
                    {isNow && attorney.availability.currentWindow && (
                      <p className="mt-2 text-green-400 font-semibold text-sm">
                        ✅ Open now until {attorney.availability.currentWindow.closesAt}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {attorney.websiteUri && (
                      <a
                        href={attorney.websiteUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-6 py-3 rounded-xl font-bold text-center transition-colors ${
                          isNow
                            ? 'bg-green-500 hover:bg-green-400 text-white text-lg'
                            : 'bg-red-600 hover:bg-red-500 text-white'
                        }`}
                      >
                        📞 Call Now
                      </a>
                    )}
                    {attorney.googleMapsUri && (
                      <a
                        href={attorney.googleMapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 rounded-xl font-medium text-center bg-gray-700 hover:bg-gray-600 text-white text-sm"
                      >
                        📍 Get Directions
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {attorneys.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No Emergency Data Yet</h2>
            <p className="text-gray-400 mb-6">
              We haven&apos;t found emergency {pa.displayName.toLowerCase()} attorneys for {city.name} yet.
            </p>
            <Link
              href={`/${city.slug}`}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              ← View all attorneys in {city.name}
            </Link>
          </div>
        )}

        {/* Other Emergency Categories */}
        <section className="mt-12 pt-8 border-t border-gray-700">
          <h2 className="text-xl font-bold mb-4">Other Emergency Services in {city.name}</h2>
          <div className="flex flex-wrap gap-3">
            {EMERGENCY_PRACTICE_AREAS.filter((p) => p !== pa.slug).map((slug) => {
              const p = getPracticeAreaBySlug(slug);
              if (!p) return null;
              return (
                <Link
                  key={slug}
                  href={`/emergency/${slug}/${city.slug}`}
                  className="bg-red-900/50 hover:bg-red-800 border border-red-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  🚨 {p.displayName}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
