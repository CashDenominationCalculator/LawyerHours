import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'LawyerHours — Find Attorneys Available Right Now',
    template: '%s | LawyerHours',
  },
  description: 'Find attorneys available right now — evening hours, weekend appointments, and emergency legal help. Stop waiting until Monday.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lawyerhours.com'),
  openGraph: {
    type: 'website',
    siteName: 'LawyerHours',
    title: 'LawyerHours — Find Attorneys Available Right Now',
    description: 'Find attorneys available right now — evening hours, weekend appointments, and emergency legal help.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
