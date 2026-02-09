'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CityStatus {
  name: string;
  stateCode: string;
  slug: string;
  population: number;
  totalAttorneys: number;
  lastRefresh: string | null;
  hoursSinceRefresh: number | null;
  status: 'never_fetched' | 'fresh' | 'stale' | 'very_stale';
}

interface StatusSummary {
  totalCities: number;
  citiesFetched: number;
  citiesNeverFetched: number;
  citiesFresh: number;
  citiesStale: number;
  totalAttorneys: number;
  attorneysWithHours: number;
  totalSecondaryHours: number;
}

interface FetchLog {
  timestamp: string;
  city: string;
  type: 'info' | 'success' | 'error' | 'skip' | 'progress';
  message: string;
}

interface ApiKeyStatus {
  configured: boolean;
  valid: boolean;
  error: string | null;
  keyPrefix?: string;
}

export default function AdminPage() {
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus | null>(null);
  const [summary, setSummary] = useState<StatusSummary | null>(null);
  const [cities, setCities] = useState<CityStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingCity, setFetchingCity] = useState<string | null>(null);
  const [bulkFetching, setBulkFetching] = useState(false);
  const [logs, setLogs] = useState<FetchLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'never_fetched' | 'fresh' | 'stale' | 'very_stale'>('all');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addLog = useCallback((type: FetchLog['type'], city: string, message: string) => {
    setLogs((prev) => [
      ...prev.slice(-200), // Keep last 200 logs
      {
        timestamp: new Date().toLocaleTimeString(),
        city,
        type,
        message,
      },
    ]);
  }, []);

  // Scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Load status on mount
  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const [statusRes, keyRes] = await Promise.all([
        fetch('/api/fetch-attorneys/status'),
        fetch('/api/fetch-attorneys/test-key'),
      ]);

      const statusData = await statusRes.json();
      const keyData = await keyRes.json();

      setSummary(statusData.summary);
      setCities(statusData.cities);
      setApiKeyStatus(keyData);
    } catch (error) {
      console.error('Failed to load status:', error);
      addLog('error', 'System', 'Failed to load status data');
    } finally {
      setLoading(false);
    }
  }, [addLog]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Fetch single city
  const fetchCity = async (slug: string, force = false) => {
    const cityData = cities.find((c) => c.slug === slug);
    const cityName = cityData ? `${cityData.name}, ${cityData.stateCode}` : slug;

    setFetchingCity(slug);
    addLog('info', cityName, 'Starting fetch...');

    try {
      const url = `/api/fetch-attorneys/${slug}${force ? '?force=true' : ''}`;
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();

      if (data.cached) {
        addLog('skip', cityName, `Skipped: ${data.message}`);
      } else if (data.success) {
        addLog(
          'success',
          cityName,
          `${data.totalFromApi} from API → ${data.created} created, ${data.updated} updated, ${data.skipped} skipped (${data.strategy}, ${data.durationMs}ms)`
        );
      } else {
        addLog('error', cityName, data.error || 'Unknown error');
      }

      // Refresh status
      await loadStatus();
    } catch (error) {
      addLog('error', cityName, `Fetch failed: ${error}`);
    } finally {
      setFetchingCity(null);
    }
  };

  // Bulk fetch with SSE streaming
  const startBulkFetch = async (force = false) => {
    if (bulkFetching) return;

    setBulkFetching(true);
    addLog('info', 'BULK', `Starting bulk fetch (${force ? 'force refresh' : 'skip fresh'})...`);

    try {
      abortControllerRef.current = new AbortController();
      const url = `/api/fetch-attorneys/bulk${force ? '?force=true' : ''}`;

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        addLog('error', 'BULK', error.error || 'Bulk fetch failed');
        setBulkFetching(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        addLog('error', 'BULK', 'No response stream available');
        setBulkFetching(false);
        return;
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleSSEEvent(eventType, data);
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        addLog('info', 'BULK', 'Bulk fetch cancelled');
      } else {
        addLog('error', 'BULK', `Bulk fetch error: ${error}`);
      }
    } finally {
      setBulkFetching(false);
      abortControllerRef.current = null;
      await loadStatus();
    }
  };

  const handleSSEEvent = (event: string, data: Record<string, unknown>) => {
    switch (event) {
      case 'start':
        addLog('info', 'BULK', `Processing ${data.totalCities} cities...`);
        break;
      case 'city_start':
        addLog('progress', data.city as string, `[${data.index}/${data.total}] Fetching...`);
        break;
      case 'city_complete':
        addLog(
          'success',
          data.city as string,
          `[${data.index}] ${data.totalFromApi} from API → ${data.created} created, ${data.updated} updated (${data.strategy}, ${data.durationMs}ms)`
        );
        break;
      case 'city_skip':
        addLog('skip', data.city as string, `[${data.index}] Skipped: ${data.reason} (${data.existingCount} existing)`);
        break;
      case 'city_error':
        addLog('error', data.city as string, `[${data.index}] Error: ${data.error}`);
        break;
      case 'complete':
        addLog(
          'info',
          'BULK',
          `Complete! ${data.citiesComplete}/${data.totalCities} cities, ${data.totalFromApi} places from API, ${data.totalCreated} created, ${data.totalUpdated} updated`
        );
        break;
    }
  };

  const cancelBulkFetch = () => {
    abortControllerRef.current?.abort();
  };

  const filteredCities = cities.filter((c) => filter === 'all' || c.status === filter);

  const getStatusBadge = (status: CityStatus['status']) => {
    switch (status) {
      case 'fresh':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Fresh</span>;
      case 'stale':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Stale</span>;
      case 'very_stale':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Very Stale</span>;
      case 'never_fetched':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Never Fetched</span>;
    }
  };

  const getLogIcon = (type: FetchLog['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'skip': return '⏭️';
      case 'info': return 'ℹ️';
      case 'progress': return '🔄';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Google Places API data management</p>
        </div>
        <button
          onClick={loadStatus}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
        >
          🔄 Refresh Status
        </button>
      </div>

      {/* API Key Status */}
      <div className={`rounded-xl p-5 mb-6 border ${
        apiKeyStatus?.valid
          ? 'bg-green-50 border-green-200'
          : apiKeyStatus?.configured
          ? 'bg-red-50 border-red-200'
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">
            {apiKeyStatus?.valid ? '✅' : apiKeyStatus?.configured ? '❌' : '⚠️'}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900">
              Google Places API Key:
              {apiKeyStatus?.valid
                ? ' Active & Valid'
                : apiKeyStatus?.configured
                ? ' Configured but Invalid'
                : ' Not Configured'}
            </h3>
            {apiKeyStatus?.error && (
              <p className="text-sm text-red-600 mt-1">{apiKeyStatus.error}</p>
            )}
            {apiKeyStatus?.keyPrefix && (
              <p className="text-sm text-gray-500 mt-1">Key: {apiKeyStatus.keyPrefix}</p>
            )}
            {!apiKeyStatus?.configured && (
              <p className="text-sm text-yellow-700 mt-1">
                Set <code className="bg-white px-1 rounded">GOOGLE_PLACES_API_KEY</code> in your .env file
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <StatCard label="Total Cities" value={summary.totalCities} />
          <StatCard label="Fetched" value={summary.citiesFetched} color="green" />
          <StatCard label="Never Fetched" value={summary.citiesNeverFetched} color="gray" />
          <StatCard label="Fresh" value={summary.citiesFresh} color="green" />
          <StatCard label="Stale" value={summary.citiesStale} color="yellow" />
          <StatCard label="Attorneys" value={summary.totalAttorneys} color="blue" />
          <StatCard label="With Hours" value={summary.attorneysWithHours} color="purple" />
          <StatCard label="Hour Records" value={summary.totalSecondaryHours} color="indigo" />
        </div>
      )}

      {/* Bulk Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk Operations</h2>
        <div className="flex flex-wrap gap-3">
          {!bulkFetching ? (
            <>
              <button
                onClick={() => startBulkFetch(false)}
                disabled={!apiKeyStatus?.valid}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
              >
                🚀 Fetch All Cities (Skip Fresh)
              </button>
              <button
                onClick={() => startBulkFetch(true)}
                disabled={!apiKeyStatus?.valid}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
              >
                🔄 Force Refresh All Cities
              </button>
              <button
                onClick={() => {
                  const unfetched = cities.filter((c) => c.status === 'never_fetched').map((c) => c.slug);
                  if (unfetched.length === 0) {
                    addLog('info', 'BULK', 'All cities have been fetched');
                    return;
                  }
                  addLog('info', 'BULK', `Fetching ${unfetched.length} never-fetched cities...`);
                  startBulkFetch(false);
                }}
                disabled={!apiKeyStatus?.valid || (summary?.citiesNeverFetched || 0) === 0}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
              >
                📡 Fetch Never-Fetched ({summary?.citiesNeverFetched || 0})
              </button>
            </>
          ) : (
            <button
              onClick={cancelBulkFetch}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              ⏹ Cancel Bulk Fetch
            </button>
          )}
        </div>
        {bulkFetching && (
          <div className="mt-4 flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-sm text-blue-700 font-medium">Bulk fetch in progress...</span>
          </div>
        )}
      </div>

      {/* Activity Log */}
      {logs.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 mb-6 max-h-64 overflow-y-auto font-mono text-xs">
          <div className="flex items-center justify-between mb-2 sticky top-0 bg-gray-900 pb-2">
            <span className="text-gray-400 font-sans text-sm font-medium">Activity Log</span>
            <button
              onClick={() => setLogs([])}
              className="text-gray-500 hover:text-gray-300 text-xs font-sans"
            >
              Clear
            </button>
          </div>
          {logs.map((log, i) => (
            <div key={i} className={`py-0.5 ${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-green-400' :
              log.type === 'skip' ? 'text-yellow-400' :
              log.type === 'progress' ? 'text-blue-400' :
              'text-gray-400'
            }`}>
              <span className="text-gray-600">{log.timestamp}</span>{' '}
              {getLogIcon(log.type)} [{log.city}] {log.message}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      )}

      {/* City List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Cities ({filteredCities.length})</h2>
          <div className="flex gap-2">
            {(['all', 'never_fetched', 'fresh', 'stale', 'very_stale'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">City</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Attorneys</th>
                <th className="text-center px-4 py-3 font-medium">Last Refresh</th>
                <th className="text-center px-4 py-3 font-medium">Population</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCities.map((city) => (
                <tr key={city.slug} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a href={`/${city.slug}`} className="font-medium text-gray-900 hover:text-blue-600" target="_blank" rel="noopener noreferrer">
                      {city.name}, {city.stateCode}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(city.status)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-gray-700">
                    {city.totalAttorneys}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {city.lastRefresh
                      ? `${city.hoursSinceRefresh}h ago`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {city.population.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => fetchCity(city.slug)}
                        disabled={fetchingCity === city.slug || bulkFetching || !apiKeyStatus?.valid}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        {fetchingCity === city.slug ? '⏳' : '📡'} Fetch
                      </button>
                      <button
                        onClick={() => fetchCity(city.slug, true)}
                        disabled={fetchingCity === city.slug || bulkFetching || !apiKeyStatus?.valid}
                        className="px-3 py-1 bg-orange-50 hover:bg-orange-100 disabled:bg-gray-50 disabled:text-gray-400 text-orange-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        🔄 Force
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">📖 How to Use</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>1. Set API Key:</strong> Add <code className="bg-white px-1 rounded">GOOGLE_PLACES_API_KEY=your-key</code> to your <code className="bg-white px-1 rounded">.env</code> file and restart the server.</p>
          <p><strong>2. Fetch Individual City:</strong> Click the &quot;Fetch&quot; button next to any city to pull data from Google Places.</p>
          <p><strong>3. Bulk Fetch:</strong> Click &quot;Fetch All Cities&quot; to stream-fetch all 50 cities. Progress shows in the activity log.</p>
          <p><strong>4. Force Refresh:</strong> Use &quot;Force&quot; to re-fetch a city even if it was recently fetched (within 6 hours).</p>
          <p><strong>5. Auto-Strategy:</strong> Large cities use grid search (5 API calls), medium cities use multi-radius (4 calls), small cities use single call.</p>
          <p><strong>API Endpoints:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><code className="bg-white px-1 rounded">POST /api/fetch-attorneys/[citySlug]</code> — Fetch single city</li>
            <li><code className="bg-white px-1 rounded">GET /api/fetch-attorneys/[citySlug]</code> — Check city status</li>
            <li><code className="bg-white px-1 rounded">GET /api/fetch-attorneys/bulk</code> — Stream bulk fetch (SSE)</li>
            <li><code className="bg-white px-1 rounded">POST /api/fetch-attorneys/bulk</code> — JSON bulk fetch</li>
            <li><code className="bg-white px-1 rounded">GET /api/fetch-attorneys/status</code> — All cities status</li>
            <li><code className="bg-white px-1 rounded">GET /api/fetch-attorneys/test-key</code> — Test API key</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'gray' }: { label: string; value: number; color?: string }) {
  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-50 text-gray-900',
    green: 'bg-green-50 text-green-900',
    yellow: 'bg-yellow-50 text-yellow-900',
    blue: 'bg-blue-50 text-blue-900',
    purple: 'bg-purple-50 text-purple-900',
    indigo: 'bg-indigo-50 text-indigo-900',
  };

  return (
    <div className={`rounded-lg p-3 ${colorClasses[color] || colorClasses.gray}`}>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
