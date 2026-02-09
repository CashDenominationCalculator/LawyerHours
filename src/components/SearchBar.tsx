'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CITIES } from '@/lib/constants';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof CITIES>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    if (value.length > 0) {
      const filtered = CITIES.filter(
        (city) =>
          city.name.toLowerCase().includes(value.toLowerCase()) ||
          city.stateName.toLowerCase().includes(value.toLowerCase()) ||
          city.slug.includes(value.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (slug: string) => {
    setShowSuggestions(false);
    setQuery('');
    router.push(`/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex].slug);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0].slug);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Find nearest city
        let nearestCity = CITIES[0];
        let minDistance = Infinity;

        for (const city of CITIES) {
          const dist = Math.sqrt(
            Math.pow(city.lat - latitude, 2) + Math.pow(city.lng - longitude, 2)
          );
          if (dist < minDistance) {
            minDistance = dist;
            nearestCity = city;
          }
        }

        router.push(`/${nearestCity.slug}`);
      },
      () => {
        alert('Unable to retrieve your location. Please search for a city instead.');
      }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto" ref={wrapperRef}>
      <div className="relative">
        <div className="flex rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search by city name..."
              className="w-full pl-12 pr-4 py-4 text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none"
              aria-label="Search for a city"
              autoComplete="off"
            />
          </div>
          <button
            onClick={handleUseLocation}
            className="px-6 bg-[#e8a838] hover:bg-[#d69a2e] text-white font-semibold text-sm transition-colors whitespace-nowrap"
            title="Use my current location"
          >
            📍 Near Me
          </button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {suggestions.map((city, index) => (
              <button
                key={city.slug}
                onClick={() => handleSelect(city.slug)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                  index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-gray-400">📍</span>
                <div>
                  <span className="font-medium text-gray-900">{city.name}</span>
                  <span className="text-gray-500">, {city.stateCode}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
