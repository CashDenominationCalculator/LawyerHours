# LawyerHours.com

Find attorneys available right now — evening hours, weekend appointments, and emergency legal help.

## Live URLs

- **Production**: https://lawyer-hours.vercel.app
- **Admin Dashboard**: https://lawyer-hours.vercel.app/admin
- **GitHub**: https://github.com/CashDenominationCalculator/LawyerHours

## The Problem

When someone searches "personal injury attorney near me" at 8pm, every website (Avvo, FindLaw, Justia) shows the same list of 50 attorneys — all closed. But some attorneys actually have evening hours, weekend consultations, and emergency lines. No website shows this. **LawyerHours does.**

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Prisma ORM** with PostgreSQL (Supabase)
- **Google Places API (New)** for live attorney data
- **Vercel** deployment with Supabase integration

## Current Status

- **50 cities** seeded in database
- **44 cities** with live Google Places data (6 smaller/suburban cities returned 0 results)
- **1,342 attorneys** stored with full Google Places data
- **523 attorneys** with secondary/extended hours
- **1,293 secondary hour records** (evening, weekend, emergency)
- **API key**: Active and validated
- **Database**: Connected via Supabase pooler (Vercel integration)

## Completed Features

- Live Google Places API integration with smart multi-radius/grid search
- Admin dashboard with bulk fetch controls, SSE streaming, and city-level management
- City pages showing attorneys grouped by practice area with real-time availability
- Practice area + city pages with filtered attorney listings
- State overview pages with aggregated statistics
- Emergency and weekend attorney pages
- Available Now detection based on secondary hours
- Practice area auto-classification from office display names
- regularOpeningHours fallback when secondary hours are missing
- Lead capture forms on every page
- SEO: dynamic meta tags, FAQPage schema, BreadcrumbList, sitemap.xml, robots.txt
- Rate limiting (5 req/sec) for Google Places API calls
- 6-hour cache for freshly fetched cities (skip with ?force=true)

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/fetch-attorneys/[citySlug]` | Fetch attorneys from Google Places for a city |
| GET | `/api/fetch-attorneys/[citySlug]` | Check fetch status for a city |
| GET | `/api/fetch-attorneys/bulk` | SSE streaming bulk fetch for all cities |
| POST | `/api/fetch-attorneys/bulk` | JSON bulk fetch with city list |
| GET | `/api/fetch-attorneys/status` | Dashboard status for all 50 cities |
| GET | `/api/fetch-attorneys/test-key` | Validate Google Places API key |
| POST | `/api/setup?key=API_KEY` | Create DB tables and seed cities (protected) |
| POST | `/api/leads` | Submit a callback request |
| POST | `/api/contact` | Submit a contact form message |

## Page Structure

| Page | URL Pattern | Description |
|------|-------------|-------------|
| Homepage | `/` | Hero, search bar, city grid |
| City | `/houston-tx` | All attorneys in city with Available Now |
| Practice Area + City | `/personal-injury-attorney/houston-tx` | Filtered by practice area |
| State Overview | `/personal-injury-attorney/texas` | State-level aggregation |
| Emergency | `/emergency/criminal-defense/houston-tx` | Late-night emergency attorneys |
| Weekend | `/weekend/houston-tx` | Saturday & Sunday attorneys |
| Admin | `/admin` | API key status, fetch controls, city management |
| About | `/about` | Mission, how it works, privacy |
| Contact | `/contact` | Contact form, claim listing |

## Database Schema (Supabase PostgreSQL)

- **cities** — 50 US cities with coordinates, state info, and population
- **attorney_offices** — Attorney data from Google Places (name, address, hours, payment, parking, accessibility, practice areas)
- **secondary_hours** — Extended hours windows (evening, weekend, emergency) with day/time ranges
- **leads** — Callback request submissions with case type and preferred time

## Data Flow

1. Admin triggers fetch via `/admin` or API endpoint
2. `fetchLawyersSmart()` auto-selects strategy based on city population:
   - >1M pop: Grid search (center + 4 offsets, 5 API calls, ~100 results)
   - >300K pop: Multi-radius (5km, 15km, 25km, 40km, 4 API calls, ~80 results)
   - <300K pop: Single call (1 API call, ~20 results)
3. Results deduplicated by Google Place ID
4. Each place parsed via `parseGooglePlace()` extracting all fields
5. Practice areas classified from display name keywords
6. Secondary hours parsed from Google's regularSecondaryOpeningHours
7. If no secondary hours, `regularOpeningHours` used as fallback to derive evening/weekend windows
8. Attorney upserted in DB (create or update by googlePlaceId)
9. Secondary hours deleted and recreated on each refresh
10. City pages read from DB and compute real-time availability

## Environment Variables

```
# Database (set automatically by Vercel-Supabase integration)
POSTGRES_PRISMA_URL=postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://...pooler.supabase.com:5432/postgres

# Google Places API
GOOGLE_PLACES_API_KEY=your-api-key

# Site URL  
NEXT_PUBLIC_SITE_URL=https://lawyer-hours.vercel.app
```

## 15 Practice Areas

Personal Injury, Car Accident, Divorce, Family Law, Criminal Defense, DUI/DWI, Estate Planning, Immigration, Bankruptcy, Real Estate, Employment Law, Workers Compensation, Medical Malpractice, Tax Law, Traffic Ticket

## 50 Cities

New York, Los Angeles, Chicago, Houston, Phoenix, Philadelphia, San Antonio, San Diego, Dallas, Austin, Jacksonville, San Jose, Fort Worth, Columbus, Indianapolis, Charlotte, San Francisco, Seattle, Denver, Washington DC, Nashville, Oklahoma City, El Paso, Portland, Las Vegas, Memphis, Louisville, Baltimore, Milwaukee, Albuquerque, Tucson, Fresno, Sacramento, Mesa, Kansas City, Atlanta, Omaha, Colorado Springs, Raleigh, Miami, Tampa, Minneapolis, New Orleans, Cleveland, Tulsa, Honolulu, Pittsburgh, St. Louis, Detroit, Boston

## Next Steps

- [ ] Set up cron job for weekly auto-refresh of all cities
- [ ] Add custom domain (lawyerhours.com)
- [ ] Implement city-level caching for faster page loads
- [ ] Add more granular practice area detection (beyond display name keywords)
- [ ] Implement attorney profile pages with full details
- [ ] Add Google Maps embed on city/attorney pages
- [ ] Email notification system for leads
- [ ] Analytics dashboard for lead tracking

## Development

```bash
npm install
npm run dev
```

Build:
```bash
npm run build
```

## Deployment

The app is deployed on Vercel with Supabase PostgreSQL integration. Database connection uses the Supabase connection pooler (port 6543) for serverless compatibility.

**Last Updated**: 2026-02-09
