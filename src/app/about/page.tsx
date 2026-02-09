import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About LawyerHours — Our Mission to Improve Legal Access',
  description: 'LawyerHours helps people find attorneys available outside traditional business hours. Learn about our mission, how we work, and why extended-hours legal access matters.',
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">About</span>
      </nav>

      <h1 className="text-4xl font-bold text-gray-900 mb-8">About LawyerHours</h1>

      {/* Mission */}
      <section className="prose prose-lg max-w-none mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          LawyerHours exists to solve a simple but critical problem: when you need an attorney 
          outside of 9-to-5 business hours, existing legal directories are useless. They show 
          you the same list of 50 attorneys — all closed.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          But some attorneys actually offer evening consultations, weekend walk-in hours, and 
          emergency phone lines. The problem is that no legal website surfaces this information. 
          Until now.
        </p>
        <p className="text-gray-600 leading-relaxed">
          LawyerHours uses the Google Places API to automatically find and display extended 
          operating hours for attorney offices across the top 50 US cities. We show you who&apos;s 
          available right now, who offers evening consultations, who has weekend hours, and who 
          provides emergency availability — information that other legal directories completely ignore.
        </p>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-2xl mb-3">📡</div>
            <h3 className="font-semibold text-gray-900 mb-2">1. Data Collection</h3>
            <p className="text-sm text-gray-600">
              We use the Google Places API (New) to gather attorney office data including 
              secondary operating hours, payment methods, parking, and accessibility information.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-2xl mb-3">⏰</div>
            <h3 className="font-semibold text-gray-900 mb-2">2. Hours Analysis</h3>
            <p className="text-sm text-gray-600">
              We parse secondary hours to identify evening consultations, weekend walk-ins, 
              and emergency availability — then check these against the current time.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-2xl mb-3">🟢</div>
            <h3 className="font-semibold text-gray-900 mb-2">3. Real-Time Display</h3>
            <p className="text-sm text-gray-600">
              When you visit a city page, we instantly calculate which attorneys are available 
              right now and highlight them with a pulsing green indicator.
            </p>
          </div>
        </div>
      </section>

      {/* What We Show */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Show You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4">
            <span className="text-xl">🌙</span>
            <div>
              <h3 className="font-semibold text-gray-900">Evening Hours</h3>
              <p className="text-sm text-gray-600">After-hours consultation windows, typically 5PM–9PM</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-purple-50 rounded-lg p-4">
            <span className="text-xl">📅</span>
            <div>
              <h3 className="font-semibold text-gray-900">Weekend Hours</h3>
              <p className="text-sm text-gray-600">Saturday and Sunday availability for consultations</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-red-50 rounded-lg p-4">
            <span className="text-xl">🚨</span>
            <div>
              <h3 className="font-semibold text-gray-900">Emergency Availability</h3>
              <p className="text-sm text-gray-600">Late-night and 24/7 emergency legal assistance</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4">
            <span className="text-xl">💳</span>
            <div>
              <h3 className="font-semibold text-gray-900">Payment Methods</h3>
              <p className="text-sm text-gray-600">Credit cards, debit cards, cash, and contactless payments</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-amber-50 rounded-lg p-4">
            <span className="text-xl">🅿️</span>
            <div>
              <h3 className="font-semibold text-gray-900">Parking Info</h3>
              <p className="text-sm text-gray-600">Free lots, paid garages, street parking, and valet</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-indigo-50 rounded-lg p-4">
            <span className="text-xl">♿</span>
            <div>
              <h3 className="font-semibold text-gray-900">Accessibility</h3>
              <p className="text-sm text-gray-600">Wheelchair-accessible entrances, parking, restrooms, and seating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-600 space-y-4">
          <p>
            LawyerHours collects minimal data. We use Google Places API data to display 
            attorney office information that is already publicly available on Google Maps.
          </p>
          <p>
            When you submit a callback request form, we store your name, phone number, email, 
            and case type to facilitate connecting you with an attorney. We do not sell your 
            personal information to third parties.
          </p>
          <p>
            We may use anonymous analytics to improve our service. We do not use tracking 
            cookies for advertising purposes.
          </p>
        </div>
      </section>

      {/* Terms */}
      <section id="terms" className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-600 space-y-4">
          <p>
            LawyerHours provides attorney office information sourced from Google Maps. 
            We make every effort to keep this data accurate and up-to-date, but we cannot 
            guarantee accuracy of hours, contact information, or other details.
          </p>
          <p>
            Always verify operating hours directly with the attorney&apos;s office before visiting. 
            LawyerHours is not a law firm and does not provide legal advice. The information 
            on this site is for informational purposes only.
          </p>
          <p>
            LawyerHours does not endorse any specific attorney or law firm. Listing on this 
            site does not imply a recommendation or guarantee of quality.
          </p>
        </div>
      </section>

      <div className="text-center">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-[#1a2332] hover:bg-[#2a3342] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Contact Us →
        </Link>
      </div>
    </div>
  );
}
