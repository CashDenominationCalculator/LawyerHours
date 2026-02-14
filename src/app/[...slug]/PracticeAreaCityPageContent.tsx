import Link from 'next/link';
import { getCityBySlug, getPracticeAreaBySlug, PRACTICE_AREAS, SITE_URL } from '@/lib/constants';
import { getAttorneysByCityAndPracticeArea, computeStats } from '@/lib/data';
import { getArticleContent } from '@/lib/article-content';
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
  const article = getArticleContent(paSlug, citySlug);

  const editorial = pa.editorial
    .replace(/{city}/g, city.name)
    .replace(/{state}/g, city.stateName);

  // Standard auto-generated FAQs
  const baseFaqs = [
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

  // Merge additional article FAQs if available
  const faqs = article
    ? [...article.additionalFaqs, ...baseFaqs]
    : baseFaqs;

  // Schema: BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: city.stateName, item: `${SITE_URL}/${pa.slug}-attorney/${city.stateSlug}` },
      { '@type': 'ListItem', position: 3, name: `${city.name}, ${city.stateCode}`, item: `${SITE_URL}/${pa.slug}-attorney/${city.slug}` },
    ],
  };

  // Schema: Article (EEAT - helps Google understand this is editorial content)
  const articleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.metaTitle,
    description: article.metaDescription,
    dateModified: new Date().toISOString(),
    datePublished: '2026-02-10T00:00:00.000Z',
    author: {
      '@type': 'Organization',
      name: 'LawyerHours',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LawyerHours',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/${pa.slug}-attorney/${city.slug}`,
    },
    about: {
      '@type': 'LegalService',
      name: `${pa.displayName} Attorneys in ${city.name}, ${city.stateCode}`,
      areaServed: {
        '@type': 'City',
        name: city.name,
        addressRegion: city.stateCode,
        addressCountry: 'US',
      },
    },
  } : null;

  // Schema: LegalService for each attorney with hours
  const legalServiceSchemas = attorneys.slice(0, 20).map((attorney) => ({
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: attorney.displayName,
    address: attorney.formattedAddress ? {
      '@type': 'PostalAddress',
      streetAddress: attorney.formattedAddress,
      addressLocality: city.name,
      addressRegion: city.stateCode,
      addressCountry: 'US',
    } : undefined,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: attorney.latitude,
      longitude: attorney.longitude,
    },
    url: attorney.websiteUri || attorney.googleMapsUri || undefined,
    areaServed: {
      '@type': 'City',
      name: city.name,
    },
  }));

  const sectionIconMap: Record<string, string> = {
    jurisdiction: '🏛️',
    guide: '📋',
    process: '🔄',
    cost: '💰',
    tip: '💡',
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      {legalServiceSchemas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(legalServiceSchemas) }}
        />
      )}

      {stats.availableNow.length > 0 && (
        <AvailableNowBanner count={stats.availableNow.length} cityName={city.name} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
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

        {/* H1 */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          {pa.displayName} Attorneys with Evening &amp; Weekend Hours in {city.name}, {city.stateCode}
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {stats.total} attorneys found — {stats.eveningCount} evening, {stats.weekendCount} weekend, {stats.emergencyCount} emergency
        </p>

        {/* EEAT: Last updated + author attribution */}
        {article && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-6">
            <span>Last reviewed: <strong className="text-gray-700">{article.lastReviewed}</strong></span>
            <span className="hidden sm:inline">·</span>
            <span>By <strong className="text-gray-700">{article.reviewedBy}</strong></span>
            <span className="hidden sm:inline">·</span>
            <span>{stats.total} attorneys verified via Google Places</span>
          </div>
        )}

        {/* Introduction - article content or editorial fallback */}
        {article ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 mb-8 prose prose-gray max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.introHtml }} />
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-8">
            <p className="text-gray-700 leading-relaxed">{editorial}</p>
          </div>
        )}

        {/* Quick Stats Bar */}
        <StatisticsSection
          cityName={city.name}
          totalAttorneys={stats.total}
          eveningCount={stats.eveningCount}
          weekendCount={stats.weekendCount}
          emergencyCount={stats.emergencyCount}
        />

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

        {/* ============================================ */}
        {/* EEAT ARTICLE CONTENT - Rich, helpful guide   */}
        {/* ============================================ */}
        {article && (
          <article className="mb-12">
            <div className="border-t border-gray-200 pt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Guide: {pa.displayName} in {city.name}, {city.stateCode}
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                A practical overview of {pa.displayName.toLowerCase()} in {city.name} — court locations, filing costs, key statutes, and what to expect.
              </p>

              <div className="space-y-10">
                {article.sections.map((section, i) => (
                  <section key={i} className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>{sectionIconMap[section.type || 'guide'] || '📋'}</span>
                      {section.heading}
                    </h3>
                    <div
                      className="prose prose-gray max-w-none prose-li:marker:text-gray-400 prose-a:text-blue-600 prose-th:text-left"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </section>
                ))}
              </div>

              {/* Jurisdiction Notice - EEAT/YMYL compliance */}
              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg mt-0.5">⚖️</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-800 mb-1">Jurisdiction Notice</p>
                    <p className="text-sm text-blue-700">{article.jurisdictionNote}</p>
                  </div>
                </div>
              </div>

              {/* Sources - EEAT credibility */}
              <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">Sources</p>
                <div dangerouslySetInnerHTML={{ __html: article.sourcesHtml }} />
              </div>
            </div>
          </article>
        )}

        {/* Lead Form */}
        <div className="my-12">
          <LeadForm sourcePageUrl={`/${pa.slug}-attorney/${city.slug}`} />
        </div>

        {/* FAQ Section */}
        <FAQSection faqs={faqs} />

        {/* YMYL Legal Disclaimer */}
        <div className="mt-8 mb-12 bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-gray-400 text-lg mt-0.5">ℹ️</span>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Legal Disclaimer</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                The information on this page is for general informational purposes only and does not constitute legal advice.
                No attorney-client relationship is formed by using this directory. Attorney availability, hours, and contact details
                are sourced from Google Places and may change without notice. Always verify information directly with the
                attorney&apos;s office. If you are experiencing a legal emergency, contact local law enforcement or call 911.
                For legal aid in San Diego County, contact the <a href="https://www.lassd.org/" className="text-blue-500 hover:underline" target="_blank" rel="nofollow noopener">Legal Aid Society of San Diego</a>.
              </p>
            </div>
          </div>
        </div>

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

        {/* Back links */}
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
