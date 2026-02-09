import Link from 'next/link';
import { getPracticeAreaBySlug, getCitiesByState, getUniqueStates, PRACTICE_AREAS, SITE_URL } from '@/lib/constants';
import { getStateSummary } from '@/lib/data';
import StatisticsSection from '@/components/StatisticsSection';

interface Props {
  paSlug: string;
  stateSlug: string;
}

export default async function StateOverviewPageContent({ paSlug, stateSlug }: Props) {
  const pa = getPracticeAreaBySlug(paSlug)!;
  const states = getUniqueStates();
  const state = states.find((s) => s.stateSlug === stateSlug)!;
  const stateCities = getCitiesByState(stateSlug);
  const summary = await getStateSummary(stateSlug);

  const eveningPct = summary.totalAttorneys > 0
    ? Math.round((summary.eveningCount / summary.totalAttorneys) * 100)
    : 0;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${pa.displayName} in ${state.stateName}`,
        item: `${SITE_URL}/${pa.slug}-attorney/${stateSlug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{pa.displayName} in {state.stateName}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {pa.displayName} Attorneys with Evening & Weekend Hours in {state.stateName}
        </h1>

        {summary.totalAttorneys > 0 ? (
          <p className="text-lg text-gray-600 mb-8">
            {eveningPct}% of attorneys in {state.stateName} offer evening hours.
            {summary.totalAttorneys} total attorneys across {stateCities.length} cities.
          </p>
        ) : (
          <p className="text-lg text-gray-600 mb-8">
            Browse {pa.displayName.toLowerCase()} attorneys across {stateCities.length} cities in {state.stateName}.
          </p>
        )}

        <StatisticsSection
          cityName={state.stateName}
          totalAttorneys={summary.totalAttorneys}
          eveningCount={summary.eveningCount}
          weekendCount={summary.weekendCount}
          emergencyCount={summary.emergencyCount}
        />

        {/* City Links */}
        <section className="py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {pa.displayName} Attorneys by City in {state.stateName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {summary.cities.map(({ city, totalAttorneys, eveningCount, weekendCount }) => (
              <Link
                key={city.slug}
                href={`/${pa.slug}-attorney/${city.slug}`}
                className="bg-white border border-gray-200 hover:border-[#2d8a4e] rounded-xl p-5 transition-all hover:shadow-md group"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-[#2d8a4e] mb-1">
                  {city.name}, {city.stateCode}
                </h3>
                <p className="text-sm text-gray-500">
                  {totalAttorneys} attorneys
                  {eveningCount > 0 && ` · ${eveningCount} evening`}
                  {weekendCount > 0 && ` · ${weekendCount} weekend`}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Other Practice Areas */}
        <section className="py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Other Practice Areas in {state.stateName}
          </h2>
          <div className="flex flex-wrap gap-3">
            {PRACTICE_AREAS.filter((p) => p.slug !== pa.slug).map((p) => (
              <Link
                key={p.slug}
                href={`/${p.slug}-attorney/${stateSlug}`}
                className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors"
              >
                {p.displayName}
              </Link>
            ))}
          </div>
        </section>

        <div className="py-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
