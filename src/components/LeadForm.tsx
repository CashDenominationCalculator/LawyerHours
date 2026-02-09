'use client';

import { useState } from 'react';

interface LeadFormProps {
  attorneyOfficeId?: number;
  sourcePageUrl?: string;
}

export default function LeadForm({ attorneyOfficeId, sourcePageUrl }: LeadFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    caseType: '',
    preferredTime: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          attorneyOfficeId,
          sourcePageUrl: sourcePageUrl || window.location.href,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ clientName: '', clientEmail: '', clientPhone: '', caseType: '', preferredTime: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h3 className="text-lg font-semibold text-green-800">Request Submitted!</h3>
        <p className="text-green-600 text-sm mt-1">
          We&apos;ve received your callback request. An attorney will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 Request a Callback</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.clientEmail}
            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
            <select
              value={formData.caseType}
              onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select a case type...</option>
              <option value="personal-injury">Personal Injury</option>
              <option value="car-accident">Car Accident</option>
              <option value="criminal-defense">Criminal Defense</option>
              <option value="dui">DUI / DWI</option>
              <option value="divorce">Divorce</option>
              <option value="family-law">Family Law</option>
              <option value="immigration">Immigration</option>
              <option value="bankruptcy">Bankruptcy</option>
              <option value="employment">Employment Law</option>
              <option value="real-estate">Real Estate</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
            <select
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Any time</option>
              <option value="morning">Morning (9AM-12PM)</option>
              <option value="afternoon">Afternoon (12PM-5PM)</option>
              <option value="evening">Evening (5PM-9PM)</option>
              <option value="asap">ASAP - Urgent</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
        >
          {status === 'submitting' ? 'Submitting...' : 'Request Callback'}
        </button>
        {status === 'error' && (
          <p className="text-red-600 text-sm text-center">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  );
}
