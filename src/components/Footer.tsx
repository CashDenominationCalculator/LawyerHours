import Link from 'next/link';
import { CITIES } from '@/lib/constants';

const TOP_CITIES = CITIES.slice(0, 10);

export default function Footer() {
  return (
    <footer className="bg-[#1a2332] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <span className="text-[#2d8a4e]">⚖️</span>
              <span>Lawyer<span className="text-[#e8a838]">Hours</span></span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Find attorneys available right now — evening hours, weekend appointments, 
              and emergency legal help in your city.
            </p>
          </div>

          {/* Top Cities */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Top Cities</h3>
            <ul className="space-y-2">
              {TOP_CITIES.slice(0, 5).map((city) => (
                <li key={city.slug}>
                  <Link href={`/${city.slug}`} className="text-sm hover:text-[#e8a838] transition-colors">
                    {city.name}, {city.stateCode}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">More Cities</h3>
            <ul className="space-y-2">
              {TOP_CITIES.slice(5, 10).map((city) => (
                <li key={city.slug}>
                  <Link href={`/${city.slug}`} className="text-sm hover:text-[#e8a838] transition-colors">
                    {city.name}, {city.stateCode}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:text-[#e8a838] transition-colors">About</Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-[#e8a838] transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="/about#privacy" className="text-sm hover:text-[#e8a838] transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/about#terms" className="text-sm hover:text-[#e8a838] transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} LawyerHours.com. All rights reserved.</p>
          <p className="mt-1">
            Attorney information is sourced from Google Maps and updated regularly. 
            Verify hours directly with the attorney&apos;s office before visiting.
          </p>
        </div>
      </div>
    </footer>
  );
}
