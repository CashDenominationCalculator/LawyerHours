import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-[#1a2332] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-[#2d8a4e]">⚖️</span>
            <span>Lawyer<span className="text-[#e8a838]">Hours</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="hover:text-[#e8a838] transition-colors">
              Find Attorneys
            </Link>
            <Link href="/about" className="hover:text-[#e8a838] transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-[#e8a838] transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
