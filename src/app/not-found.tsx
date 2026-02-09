import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-6xl mb-6">⚖️</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist. Try searching for a city 
          to find attorneys with extended hours.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#1a2332] hover:bg-[#2a3342] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
