'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    type: 'general', // general | claim
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '', type: 'general' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">Contact</span>
      </nav>

      <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Us a Message</h2>

          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="text-lg font-semibold text-green-800">Message Sent!</h3>
              <p className="text-green-600 text-sm mt-1">
                Thank you for reaching out. We&apos;ll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8a4e] focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8a4e] focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8a4e] focus:border-transparent resize-vertical"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3 px-6 bg-[#1a2332] hover:bg-[#2a3342] disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
              {status === 'error' && (
                <p className="text-red-600 text-sm text-center">Something went wrong. Please try again.</p>
              )}
            </form>
          )}
        </div>

        {/* Claim Your Listing */}
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              ⚖️ Are You an Attorney?
            </h2>
            <h3 className="text-lg font-medium text-amber-800 mb-3">Claim Your Listing</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you&apos;re an attorney and want to verify or update your listing on 
              LawyerHours, we&apos;d love to hear from you. Claiming your listing allows you to:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                Verify your extended hours are accurate
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                Ensure your contact information is correct
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                Add practice areas to your listing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                Highlight your emergency availability
              </li>
            </ul>
            <p className="text-sm text-gray-500">
              Send us an email with your office name and Google Maps link, and we&apos;ll 
              help you get set up.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-900">Email:</span>{' '}
                <a href="mailto:hello@lawyerhours.com" className="text-blue-600 hover:underline">
                  hello@lawyerhours.com
                </a>
              </p>
              <p>
                <span className="font-medium text-gray-900">For Attorneys:</span>{' '}
                <a href="mailto:listings@lawyerhours.com" className="text-blue-600 hover:underline">
                  listings@lawyerhours.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
