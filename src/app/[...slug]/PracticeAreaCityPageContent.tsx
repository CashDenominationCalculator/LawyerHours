import Link from 'next/link';
import { getCityBySlug, getPracticeAreaBySlug, PRACTICE_AREAS, SITE_URL } from '@/lib/constants';
import { getAttorneysByCityAndPracticeArea, computeStats } from '@/lib/data';
import AttorneyCard from '@/components/AttorneyCard';
import AvailableNowBanner from '@/components/AvailableNowBanner';
import StatisticsSection from '@/components/StatisticsSection';
import FAQSection from '@/components/FAQSection';
import LeadForm from '@/components/LeadForm';

interface Props {
  paSlug: string;
  citySlug: string;
}

export default async function PracticeAreaCityPageContent({ paSlug, citySlug }: Props) {
  const pa = getPracticeAreaBySlug(paSlug)!;
  const city = getCityBySlug(citySlug)!;
  const attorneys = await getAttorneysByCityAndPracticeArea(citySlug, paSlug);
  const stats = computeStats(attorneys);

  const editorial = pa.editorial
    .replace(/{city}/g, city.name)
    .replace(/{state}/g, city.stateName);

  const faqs = [
    {
      question: `How many ${pa.displayName.toLowerCase()} attorneys in ${city.name} offer evening hours?`,
      answer: `Currently, ${stats.eveningCount} out of ${stats.total} ${pa.displayName.toLowerCase()} attorneys in ${city.name}, ${city.stateCode} offer evening consultation hours after 5pm.`,
    },
    {
      question: `Can I see a ${pa.displayName.toLowerCase()} attorney on weekends in ${city.name}?`,
      answer: `Yes! ${stats.weekendCount} ${pa.displayName.toLowerCase()} attorneys in ${city.name} offer Saturday or Sunday hours for consultations.`,
    },
    {
      question: `Are there emergency ${pa.displayName.toLowerCase()} attorneys in ${city.name}?`,
      answer: `${stats.emergencyCount} ${pa.displayName.toLowerCase()} attorneys in ${city.name} offer emergency or late-night availability.`,
    },
    {
      question: `How accurate is the availability information?`,
      answer: `We source our data from Google Places API and update it regularly. However, we recommend confirming hours directly with the attorney's office before visiting.`,
    },
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: city.stateName, item: `${SITE_URL}/${pa.slug}-attorney/${city.stateSlug}` },
      { '@type': 'ListItem', position: 3, name: `${city.name}, ${city.stateCode}`, item: `${SITE_URL}/${pa.slug}-attorney/${city.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {stats.availableNow.length > 0 && (
        <AvailableNowBanner count={stats.availableNow.length} cityName={city.name} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">›</span>
          <Link href={`/${pa.slug}-attorney/${city.stateSlug}`} className="hover:text-gray-700">
            {city.stateName}
          </Link>
          <span className="mx-2">›</span>
          <Link href={`/${city.slug}`} className="hover:text-gray-700">
            {city.name}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{pa.displayName}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          {pa.displayName} Attorneys with Evening & Weekend Hours in {city.name}, {city.stateCode}
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          {stats.total} attorneys found — {stats.eveningCount} evening, {stats.weekendCount} weekend, {stats.emergencyCount} emergency
        </p>

        {/* Editorial */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-8">
          <p className="text-gray-700 leading-relaxed">{editorial}</p>
        </div>

        {/* Available Now */}
        {stats.availableNow.length > 0 && (
          <section id="available-now" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <h2 className="text-2xl font-bold text-green-700">
                Available Right Now ({stats.availableNow.length})
              </h2>
            </div>
            <div className="grid gap-4">
              {stats.availableNow.map((attorney) => (
                <AttorneyCard
                  key={attorney.id}
                  attorney={attorney}
                  availability={attorney.availability}
                  variant="available-now"
                />
              ))}
            </div>
          </section>
        )}

        {/* All Attorneys */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All {pa.displayName} Attorneys in {city.name} ({attorneys.length})
          </h2>
          <div className="grid gap-4">
            {attorneys.map((attorney) => (
              <AttorneyCard
                key={attorney.id}
                attorney={attorney}
                availability={attorney.availability}
              />
            ))}
          </div>
          {attorneys.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Yet</h3>
              <p className="text-gray-600">
                We haven&apos;t fetched {pa.displayName.toLowerCase()} attorney data for {city.name} yet.
              </p>
            </div>
          )}
        </section>

        <StatisticsSection
          cityName={city.name}
          totalAttorneys={stats.total}
          eveningCount={stats.eveningCount}
          weekendCount={stats.weekendCount}
          emergencyCount={stats.emergencyCount}
        />

        <div className="my-12">
          <LeadForm sourcePageUrl={`/${pa.slug}-attorney/${city.slug}`} />
        </div>

        <FAQSection faqs={faqs} />

        {/* Related Practice Areas */}
        <section className="py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Related Practice Areas in {city.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {PRACTICE_AREAS.filter((p) => p.slug !== pa.slug).map((p) => (
              <Link
                key={p.slug}
                href={`/${p.slug}-attorney/${city.slug}`}
                className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors text-center"
              >
                {p.displayName}
              </Link>
            ))}
          </div>
        </section>

        <div className="py-8 flex flex-wrap gap-4">
          <Link
            href={`/${city.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            ← All Attorneys in {city.name}
          </Link>
          <Link
            href={`/${pa.slug}-attorney/${city.stateSlug}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            ← {pa.displayName} in {city.stateName}
          </Link>
        </div>
      </div>
    </>
  );
}
