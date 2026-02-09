import { MetadataRoute } from 'next';
import { CITIES, PRACTICE_AREAS, EMERGENCY_PRACTICE_AREAS, getUniqueStates } from '@/lib/constants';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lawyerhours.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  entries.push(
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  );

  // City pages
  for (const city of CITIES) {
    entries.push({
      url: `${SITE_URL}/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });

    // Weekend page per city
    entries.push({
      url: `${SITE_URL}/weekend/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    });

    // Practice area + city pages
    for (const pa of PRACTICE_AREAS) {
      entries.push({
        url: `${SITE_URL}/${pa.slug}-attorney/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }

    // Emergency pages (only for emergency practice areas)
    for (const paSlug of EMERGENCY_PRACTICE_AREAS) {
      entries.push({
        url: `${SITE_URL}/emergency/${paSlug}/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
  }

  // State overview pages
  const states = getUniqueStates();
  for (const state of states) {
    for (const pa of PRACTICE_AREAS) {
      entries.push({
        url: `${SITE_URL}/${pa.slug}-attorney/${state.stateSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
