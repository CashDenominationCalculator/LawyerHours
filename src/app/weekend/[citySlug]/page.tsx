import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCityBySlug, PRACTICE_AREAS, SITE_URL } from '@/lib/constants';
import { getAttorneysByCityWeekend, computeStats } from '@/lib/data';
import AttorneyCard from '@/components/AttorneyCard';
import FAQSection from '@/components/FAQSection';
import LeadForm from '@/components/LeadForm';

interface PageProps {
  params: { citySlug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const city = getCityBySlug(params.citySlug);
  if (!city) return {};

  const title = `Weekend Attorneys in ${city.name}, ${city.stateCode} — Saturday & Sunday Hours`;
  const description = `Find attorneys in ${city.name} with Saturday and Sunday hours. Browse weekend-available attorneys by practice area with parking, payment, and accessibility info.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/weekend/${city.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/weekend/${city.slug}` },
  };
}

export const dynamic = 'force-dynamic';

export default async function WeekendPage({ params }: PageProps) {
  const city = getCityBySlug(params.citySlug);
  if (!city) notFound();

  const attorneys = await getAttorneysByCityWeekend(params.citySlug);
  const stats = computeStats(attorneys);

  // Group by practice area
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
      question: `How many attorneys in ${city.name} have weekend hours?`,
      answer: `Currently, ${attorneys.length} attorneys in ${city.name}, ${city.stateCode} offer Saturday or Sunday consultation hours.`,
    },
    {
      question: `Can I schedule a Saturday appointment with an attorney in ${city.name}?`,
      answer: `Yes! Many of the ${attorneys.length} weekend-available attorneys in ${city.name} offer Saturday consultation hours. Check each attorney's schedule for specific Saturday availability.`,
    },
    {
      question: `Are Sunday attorney appointments available in ${city.name}?`,
      answer: `Some attorneys in ${city.name} do offer Sunday hours. Look for "Weekend Hours" badges on attorney listings to find Sunday availability.`,
    },
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: `${city.name}, ${city.stateCode}`, item: `${SITE_URL}/${city.slug}` },
      { '@type': 'ListItem', position: 3, name: 'Weekend Hours', item: `${SITE_URL}/weekend/${city.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Purple header for weekend */}
      <div className="bg-purple-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-3xl mb-3">📅</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Weekend Attorneys in {city.name}, {city.stateCode}
          </h1>
          <p className="text-purple-100 text-lg">
            {attorneys.length} attorneys with Saturday or Sunday hours
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">›</span>
          <Link href={`/${city.slug}`} className="hover:text-gray-700">{city.name}, {city.stateCode}</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Weekend Hours</span>
        </nav>

        {/* Available Now */}
        {stats.availableNow.length > 0 && (
          <section className="mb-12">
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

        {/* Grouped by Practice Area */}
        {Array.from(practiceAreaGroups.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([paSlug, paAttorneys]) => {
            const pa = PRACTICE_AREAS.find((p) => p.slug === paSlug);
            const displayName = pa?.displayName || paSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

            return (
              <section key={paSlug} className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {displayName} — Weekend Hours ({paAttorneys.length})
                </h2>
                <div className="grid gap-4">
                  {paAttorneys.map((attorney) => (
                    <AttorneyCard
                      key={attorney.id}
                      attorney={attorney}
                      availability={attorney.availability}
                    />
                  ))}
                </div>
              </section>
            );
          })}

        {attorneys.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Weekend Data Yet</h2>
            <p className="text-gray-600 mb-6">
              We haven&apos;t found weekend-available attorneys for {city.name} yet.
            </p>
            <Link
              href={`/${city.slug}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← View all attorneys in {city.name}
            </Link>
          </div>
        )}

        {/* Lead Form */}
        <div className="my-12">
          <LeadForm sourcePageUrl={`/weekend/${city.slug}`} />
        </div>

        {/* FAQs */}
        <FAQSection faqs={faqs} />

        {/* Back to city */}
        <div className="py-8">
          <Link
            href={`/${city.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← All attorneys in {city.name}, {city.stateCode}
          </Link>
        </div>
      </div>
    </>
  );
}
