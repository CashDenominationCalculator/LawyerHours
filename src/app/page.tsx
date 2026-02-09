import Link from 'next/link';
import { CITIES, SITE_URL } from '@/lib/constants';
import SearchBar from '@/components/SearchBar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Attorneys Available Right Now — Evening, Weekend & Emergency Hours',
  description: 'LawyerHours helps you find attorneys who are available right now. Evening consultations, weekend appointments, and emergency legal help in 50 major US cities.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Find Attorneys Available Right Now — Evening, Weekend & Emergency Hours',
    description: 'LawyerHours helps you find attorneys who are available right now. Evening consultations, weekend appointments, and emergency legal help in 50 major US cities.',
    url: SITE_URL,
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-[#1a2332] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Find Attorneys Available{' '}
            <span className="text-[#2d8a4e]">Right Now</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Evening consultations, weekend appointments, and emergency legal help — 
            because legal problems don&apos;t wait for business hours.
          </p>

          <SearchBar />

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              href="/emergency/criminal-defense/new-york-ny"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
            >
              🚨 Need an Attorney Tonight
            </Link>
            <Link
              href="/weekend/new-york-ny"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
            >
              📅 Weekend Appointments
            </Link>
            <Link
              href="/emergency/personal-injury/new-york-ny"
              className="inline-flex items-center gap-2 bg-[#e8a838] hover:bg-[#d69a2e] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
            >
              ⚡ Emergency Legal Help
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why LawyerHours?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center px-4">
              <div className="text-4xl mb-4">🌙</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Evening Hours</h3>
              <p className="text-gray-600">
                Find attorneys with consultation hours after 5pm. 
                No more taking time off work for legal appointments.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Weekend Availability</h3>
              <p className="text-gray-600">
                Saturday and Sunday appointments available. 
                Get legal help on your schedule, not theirs.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl mb-4">🚨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Emergency Access</h3>
              <p className="text-gray-600">
                Late-night and 24/7 emergency legal representation. 
                Because arrests and accidents happen after hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="text-2xl mb-3">🅿️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Parking Information</h3>
              <p className="text-sm text-gray-600">
                We show you which offices have free parking lots, street parking, 
                or valet — so you know before you go.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="text-2xl mb-3">💳</div>
              <h3 className="font-semibold text-gray-900 mb-2">Payment Methods</h3>
              <p className="text-sm text-gray-600">
                See which offices accept credit cards, debit cards, 
                contactless payments, or require cash.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="text-2xl mb-3">♿</div>
              <h3 className="font-semibold text-gray-900 mb-2">Accessibility</h3>
              <p className="text-sm text-gray-600">
                Wheelchair-accessible entrances, parking, restrooms, and seating — 
                clearly marked for every office.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* City Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Find Attorneys in Your City
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            We cover the top 50 US cities. Click your city to see attorneys with 
            evening, weekend, and emergency availability.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className="group flex items-center gap-2 bg-gray-50 hover:bg-[#e8f5e9] px-4 py-3 rounded-lg border border-gray-100 hover:border-[#2d8a4e] transition-all"
              >
                <span className="text-gray-400 group-hover:text-[#2d8a4e] transition-colors">📍</span>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{city.name}</div>
                  <div className="text-xs text-gray-500">{city.stateCode}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#1a2332] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Are You an Attorney?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Make sure your evening and weekend hours are visible to potential clients. 
            Claim your listing to verify your information.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#e8a838] hover:bg-[#d69a2e] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Claim Your Listing →
          </Link>
        </div>
      </section>
    </>
  );
}
