'use client';

import { useState } from 'react';
import api from '@/services/api-client';

/**
 * Example component demonstrating device context usage
 * Shows how to use the API client with automatic device context headers
 */

interface ExampleData {
  message: string;
  [key: string]: unknown;
}

export function DeviceContextExample() {
  const [data, setData] = useState<ExampleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example GET request
  const handleGetRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Device context is automatically added to headers
      const result = await api.get<ExampleData>('/api/banking/dashboard');
      setData(result);
      console.log('✅ GET request successful with device context');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
      console.error('❌ GET request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Example POST request
  const handlePostRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Device context is automatically added to headers
      const result = await api.post<ExampleData>('/api/transactions', {
        amount: 100,
        description: 'Test transaction',
      });
      setData(result);
      console.log('✅ POST request successful with device context');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
      console.error('❌ POST request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Device Context Example</h2>
      
      <p className="text-muted-foreground">
        These buttons demonstrate automatic device context injection in API requests.
        Check the browser console and network tab to see headers.
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleGetRequest}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'GET Request with Context'}
        </button>
        
        <button
          onClick={handlePostRequest}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'POST Request with Context'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {/* Response Display */}
      {data && (
        <div className="p-4 bg-green-100 border border-green-400 rounded">
          <h3 className="font-bold mb-2">Response:</h3>
          <pre className="overflow-auto text-sm bg-white p-2 rounded border">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold mb-2">Headers Being Sent:</h3>
        <ul className="text-sm space-y-1 font-mono">
          <li>✓ Authorization: Bearer &lt;token&gt;</li>
          <li>✓ x-device-posture: &lt;device info&gt;</li>
          <li>✓ x-access-context: &lt;access info&gt;</li>
          <li>✓ Content-Type: application/json</li>
        </ul>
      </div>

      {/* Console Instructions */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold mb-2">📝 How to Verify:</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Open DevTools (F12)</li>
          <li>Go to Network tab</li>
          <li>Click a button above</li>
          <li>Click the request to view headers</li>
          <li>Look for x-device-posture and x-access-context</li>
        </ol>
      </div>
    </div>
  );
}
