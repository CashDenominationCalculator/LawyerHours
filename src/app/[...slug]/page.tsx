import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getCityBySlug,
  getPracticeAreaBySlug,
  getUniqueStates,
  SITE_URL,
} from '@/lib/constants';
import { getArticleContent } from '@/lib/article-content';
import CityPageContent from './CityPageContent';
import PracticeAreaCityPageContent from './PracticeAreaCityPageContent';
import StateOverviewPageContent from './StateOverviewPageContent';

interface PageProps {
  params: { slug: string[] };
}

type PageType =
  | { type: 'city'; citySlug: string }
  | { type: 'practiceAreaCity'; paSlug: string; citySlug: string }
  | { type: 'stateOverview'; paSlug: string; stateSlug: string }
  | { type: 'notFound' };

function resolveRoute(slugParts: string[]): PageType {
  if (slugParts.length === 1) {
    // Single segment: could be a city slug like "houston-tx"
    const citySlug = slugParts[0];
    const city = getCityBySlug(citySlug);
    if (city) return { type: 'city', citySlug };
    return { type: 'notFound' };
  }

  if (slugParts.length === 2) {
    // Two segments: "personal-injury-attorney/houston-tx" or "personal-injury-attorney/texas"
    const firstPart = slugParts[0];
    const secondPart = slugParts[1];

    // Check if first part is a practice area slug (ends with -attorney)
    if (firstPart.endsWith('-attorney')) {
      const paSlug = firstPart.replace(/-attorney$/, '');
      const pa = getPracticeAreaBySlug(paSlug);
      if (!pa) return { type: 'notFound' };

      // Check if second part is a city
      const city = getCityBySlug(secondPart);
      if (city) return { type: 'practiceAreaCity', paSlug, citySlug: secondPart };

      // Check if second part is a state
      const states = getUniqueStates();
      const state = states.find((s) => s.stateSlug === secondPart);
      if (state) return { type: 'stateOverview', paSlug, stateSlug: secondPart };
    }

    return { type: 'notFound' };
  }

  return { type: 'notFound' };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const route = resolveRoute(params.slug);

  if (route.type === 'city') {
    const city = getCityBySlug(route.citySlug)!;
    const title = `Attorneys Available Now in ${city.name}, ${city.stateCode} — Evening, Weekend & Emergency Hours`;
    const description = `Find attorneys in ${city.name}, ${city.stateCode} with evening consultations, weekend appointments, and emergency availability.`;
    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/${city.slug}` },
      openGraph: { title, description, url: `${SITE_URL}/${city.slug}` },
    };
  }

  if (route.type === 'practiceAreaCity') {
    const pa = getPracticeAreaBySlug(route.paSlug)!;
    const city = getCityBySlug(route.citySlug)!;
    const article = getArticleContent(route.paSlug, route.citySlug);
    const title = article?.metaTitle || `${pa.displayName} Attorneys with Evening & Weekend Hours in ${city.name}, ${city.stateCode}`;
    const description = article?.metaDescription || `Find ${pa.displayName.toLowerCase()} attorneys in ${city.name}, ${city.stateCode} with evening consultations, weekend appointments, and emergency availability.`;
    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/${pa.slug}-attorney/${city.slug}` },
      openGraph: { title, description, url: `${SITE_URL}/${pa.slug}-attorney/${city.slug}` },
    };
  }

  if (route.type === 'stateOverview') {
    const pa = getPracticeAreaBySlug(route.paSlug)!;
    const states = getUniqueStates();
    const state = states.find((s) => s.stateSlug === route.stateSlug)!;
    const title = `${pa.displayName} Attorneys with Evening & Weekend Hours in ${state.stateName}`;
    const description = `Find ${pa.displayName.toLowerCase()} attorneys in ${state.stateName} with evening consultations, weekend appointments, and emergency availability.`;
    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/${pa.slug}-attorney/${route.stateSlug}` },
      openGraph: { title, description, url: `${SITE_URL}/${pa.slug}-attorney/${route.stateSlug}` },
    };
  }

  return {};
}

export const dynamic = 'force-dynamic';

export default async function DynamicPage({ params }: PageProps) {
  const route = resolveRoute(params.slug);

  switch (route.type) {
    case 'city':
      return <CityPageContent citySlug={route.citySlug} />;
    case 'practiceAreaCity':
      return <PracticeAreaCityPageContent paSlug={route.paSlug} citySlug={route.citySlug} />;
    case 'stateOverview':
      return <StateOverviewPageContent paSlug={route.paSlug} stateSlug={route.stateSlug} />;
    default:
      notFound();
  }
}
