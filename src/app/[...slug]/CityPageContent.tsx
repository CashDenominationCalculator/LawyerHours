import Link from 'next/link';
import { getCityBySlug, PRACTICE_AREAS, SITE_URL } from '@/lib/constants';
import { getAttorneysByCity, computeStats } from '@/lib/data';
import AttorneyCard from '@/components/AttorneyCard';
import AvailableNowBanner from '@/components/AvailableNowBanner';
import StatisticsSection from '@/components/StatisticsSection';
import FAQSection from '@/components/FAQSection';
import LeadForm from '@/components/LeadForm';

interface Props {
  citySlug: string;
}

export default async function CityPageContent({ citySlug }: Props) {
  const city = getCityBySlug(citySlug)!;
  const attorneys = await getAttorneysByCity(citySlug);
  const stats = computeStats(attorneys);

  // Group attorneys by practice area
  const practiceAreaGroups = new Map<string, typeof attorneys>();
  for (const attorney of attorneys) {
    for (const pa of attorney.practiceAreas) {
      const list = practiceAreaGroups.get(pa) || [];
      list.push(attorney);
      practiceAreaGroups.set(pa, list);
    }
  }

  const faqs = [
    {
      question: `How many attorneys in ${city.name} offer evening hours?`,
      answer: `Currently, ${stats.eveningCount} out of ${stats.total} attorneys in ${city.name}, ${city.stateCode} offer evening consultation hours after 5pm. We update this information regularly using Google Places data.`,
    },
    {
      question: `Can I find a weekend attorney in ${city.name}?`,
      answer: `Yes! ${stats.weekendCount} attorneys in ${city.name} offer Saturday or Sunday hours. Visit our weekend page for ${city.name} to see all weekend-available attorneys.`,
    },
    {
      question: `Are there emergency attorneys available in ${city.name} right now?`,
      answer: `${stats.emergencyCount} attorneys in ${city.name} offer emergency or late-night availability. Check the "Available Now" section at the top of this page to see who is open right now.`,
    },
    {
      question: `How does LawyerHours get attorney availability data?`,
      answer: `We use the Google Places API to gather attorney office information including secondary operating hours, payment methods, parking availability, and accessibility features.`,
    },
    {
      question: `Is LawyerHours free to use?`,
      answer: `Yes, LawyerHours is completely free for people looking for attorneys. We believe everyone deserves access to legal help outside traditional business hours.`,
    },
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: `${city.name}, ${city.stateCode}`, item: `${SITE_URL}/${city.slug}` },
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
          <span className="text-gray-900">{city.name}, {city.stateCode}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Attorneys Available Now in {city.name}, {city.stateCode}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Evening, weekend & emergency hours — {stats.total} attorney offices found
        </p>

        {/* Available Now Section */}
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
            <div className="grid gap-5">
              {stats.availableNow.map((attorney, index) => (
                <AttorneyCard
                  key={attorney.id}
                  attorney={attorney}
                  availability={attorney.availability}
                  variant="available-now"
                  cityName={city.name}
                  rank={index + 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Attorneys by Practice Area */}
        {Array.from(practiceAreaGroups.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([paSlug, paAttorneys]) => {
            const pa = PRACTICE_AREAS.find((p) => p.slug === paSlug);
            const displayName = pa?.displayName || paSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

            return (
              <section key={paSlug} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {displayName} ({paAttorneys.length})
                  </h2>
                  {pa && (
                    <Link
                      href={`/${pa.slug}-attorney/${city.slug}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View All →
                    </Link>
                  )}
                </div>
                <div className="grid gap-5">
                  {paAttorneys.slice(0, 5).map((attorney, index) => (
                    <AttorneyCard
                      key={attorney.id}
                      attorney={attorney}
                      availability={attorney.availability}
                      cityName={city.name}
                      practiceAreaSlug={paSlug}
                      rank={index + 1}
                    />
                  ))}
                </div>
                {paAttorneys.length > 5 && pa && (
                  <div className="mt-4 text-center">
                    <Link
                      href={`/${pa.slug}-attorney/${city.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View all {paAttorneys.length} {displayName} attorneys →
                    </Link>
                  </div>
                )}
              </section>
            );
          })}

        {attorneys.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Attorney Data Yet</h2>
            <p className="text-gray-600 mb-6">
              We haven&apos;t fetched attorney data for {city.name} yet.
              Data is populated via the Google Places API.
            </p>
          </div>
        )}

        <StatisticsSection
          cityName={city.name}
          totalAttorneys={stats.total}
          eveningCount={stats.eveningCount}
          weekendCount={stats.weekendCount}
          emergencyCount={stats.emergencyCount}
        />

        <div className="my-12">
          <LeadForm sourcePageUrl={`/${city.slug}`} />
        </div>

        <FAQSection faqs={faqs} />

        {/* Practice Area Links */}
        <section className="py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Browse by Practice Area in {city.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {PRACTICE_AREAS.map((pa) => (
              <Link
                key={pa.slug}
                href={`/${pa.slug}-attorney/${city.slug}`}
                className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors text-center"
              >
                {pa.displayName}
              </Link>
            ))}
          </div>
        </section>

        {/* Weekend & Emergency Links */}
        <section className="py-8 flex flex-wrap gap-4">
          <Link
            href={`/weekend/${city.slug}`}
            className="inline-flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-5 py-3 rounded-lg font-medium transition-colors"
          >
            📅 Weekend Attorneys in {city.name}
          </Link>
          {['criminal-defense', 'dui', 'personal-injury'].map((paSlug) => (
            <Link
              key={paSlug}
              href={`/emergency/${paSlug}/${city.slug}`}
              className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-5 py-3 rounded-lg font-medium transition-colors"
            >
              🚨 Emergency {paSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
