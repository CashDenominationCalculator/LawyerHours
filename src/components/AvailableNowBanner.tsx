'use client';

interface AvailableNowBannerProps {
  count: number;
  cityName: string;
}

export default function AvailableNowBanner({ count, cityName }: AvailableNowBannerProps) {
  if (count === 0) return null;

  return (
    <div className="sticky top-0 z-40 bg-green-600 text-white py-3 px-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <span className="font-semibold text-sm sm:text-base">
            {count} attorney{count !== 1 ? 's' : ''} available right now in {cityName}
          </span>
        </div>
        <a
          href="#available-now"
          className="text-sm font-medium bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition-colors"
        >
          View Available →
        </a>
      </div>
    </div>
  );
}
