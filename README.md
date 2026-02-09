# LawyerHours.com

Find attorneys available right now — evening hours, weekend appointments, and emergency legal help.

## The Problem

When someone searches "personal injury attorney near me" at 8pm, every website (Avvo, FindLaw, Justia) shows the same list of 50 attorneys — all closed. But some attorneys actually have evening hours, weekend consultations, and emergency lines. No website shows this. **LawyerHours does.**

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Prisma ORM** with PostgreSQL
- **Google Places API (New)** for attorney data
- Designed for **Vercel** deployment

## How to Deploy on Vercel

### 1. Set up your database

Create a PostgreSQL database on [Supabase](https://supabase.com), [Railway](https://railway.app), or [Neon](https://neon.tech). Copy the connection string.

### 2. Deploy to Vercel

```bash
# Clone this repo
git clone <your-repo-url>
cd webapp

# Push to Vercel
vercel
```

### 3. Set environment variables in Vercel

```
DATABASE_URL=postgresql://user:password@host:5432/lawyerhours
GOOGLE_PLACES_API_KEY=your-google-places-api-key
NEXT_PUBLIC_SITE_URL=https://lawyerhours.com
```

### 4. Push database schema

```bash
npx prisma db push
```

### 5. Seed cities

```bash
npx tsx prisma/seed.ts
```

### 6. Fetch attorney data

Call the API endpoint for each city:

```bash
curl -X POST https://lawyerhours.com/api/fetch-attorneys/houston-tx
curl -X POST https://lawyerhours.com/api/fetch-attorneys/new-york-ny
# ... repeat for all cities
```

## Page Structure

| Page | URL Pattern | Description |
|------|-------------|-------------|
| Homepage | `/` | Hero, search bar, city grid |
| City | `/houston-tx` | All attorneys in city with Available Now |
| Practice Area + City | `/personal-injury-attorney/houston-tx` | Filtered by practice area |
| State Overview | `/personal-injury-attorney/texas` | State-level aggregation |
| Emergency | `/emergency/criminal-defense/houston-tx` | Late-night emergency attorneys |
| Weekend | `/weekend/houston-tx` | Saturday & Sunday attorneys |
| About | `/about` | Mission, how it works, privacy |
| Contact | `/contact` | Contact form, claim listing |

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/fetch-attorneys/[citySlug]` | Fetch and store attorneys from Google Places |
| POST | `/api/leads` | Submit a callback request |
| POST | `/api/contact` | Submit a contact form message |

## Database Schema

- **cities** — 50 US cities with coordinates and population
- **attorney_offices** — Attorney data from Google Places (name, address, hours, payment, parking, accessibility)
- **secondary_hours** — Extended hours windows (evening, weekend, emergency)
- **leads** — Callback request submissions

## Key Features

- **Available Now** — Real-time detection of which attorneys are open based on secondary hours
- **Practice Area Classification** — Auto-classifies attorneys from office names
- **SEO** — Dynamic meta tags, FAQPage schema, BreadcrumbList schema, sitemap.xml, robots.txt
- **Internal Linking** — City → Practice Area → State → back, footer links
- **Emergency Pages** — Minimal design with large click-to-call buttons
- **Weekend Pages** — Saturday/Sunday availability grouped by practice area
- **Lead Forms** — Request callback forms on every page

## 15 Practice Areas

Personal Injury, Car Accident, Divorce, Family Law, Criminal Defense, DUI/DWI, Estate Planning, Immigration, Bankruptcy, Real Estate, Employment Law, Workers Compensation, Medical Malpractice, Tax Law, Traffic Ticket

## 50 Cities

New York, Los Angeles, Chicago, Houston, Phoenix, Philadelphia, San Antonio, San Diego, Dallas, Austin, Jacksonville, San Jose, Fort Worth, Columbus, Indianapolis, Charlotte, San Francisco, Seattle, Denver, Washington DC, Nashville, Oklahoma City, El Paso, Portland, Las Vegas, Memphis, Louisville, Baltimore, Milwaukee, Albuquerque, Tucson, Fresno, Sacramento, Mesa, Kansas City, Atlanta, Omaha, Colorado Springs, Raleigh, Miami, Tampa, Minneapolis, New Orleans, Cleveland, Tulsa, Honolulu, Pittsburgh, St. Louis, Detroit, Boston

## Development

```bash
npm install
npm run dev
```

Build:
```bash
npm run build
```
