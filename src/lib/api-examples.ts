"use client";

/**
 * EXAMPLE: Dashboard Component
 *
 * Shows how to fetch dashboard data using the api client.
 * Device context headers are automatically added.
 */
export const exampleDashboard = `
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { refreshDeviceContext } from '@/lib/auth-context';

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();

    // Refresh device context every 30 minutes
    const interval = setInterval(() => {
      refreshDeviceContext();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Device context headers are automatically added by api client
      const response = await api.get('/api/banking/dashboard');

      if (!response.ok) {
        throw new Error(response.error || 'Failed to load dashboard');
      }

      setDashboardData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Banking Dashboard</h1>
      <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
    </div>
  );
}
`;

/**
 * EXAMPLE: Transactions List Component
 *
 * Shows how to fetch and display a list of transactions.
 */
export const exampleTransactionsList = `
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export function TransactionsList() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await api.get('/api/transactions');

      if (response.ok) {
        setTransactions(response.data);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Recent Transactions</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {transactions.map((tx: any) => (
            <li key={tx.id}>
              {tx.type}: {tx.amount} {tx.currency}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`;

/**
 * EXAMPLE: Making POST Requests
 *
 * Shows how to create a new resource with device context.
 */
export const examplePostRequest = `
import api from '@/lib/api';

async function createTransaction(data: any) {
  const response = await api.post('/api/transactions', {
    amount: data.amount,
    recipient: data.recipient,
    type: 'transfer'
  });

  if (response.ok) {
    console.log('Transaction created:', response.data);
    return response.data;
  } else {
    console.error('Failed to create transaction:', response.error);
    throw new Error(response.error);
  }
}
`;

/**
 * EXAMPLE: Error Handling
 *
 * Shows how to handle different types of errors.
 */
export const exampleErrorHandling = `
import api from '@/lib/api';

async function fetchWithErrorHandling() {
  try {
    const response = await api.get('/api/sensitive-data');

    // Check if request was successful
    if (!response.ok) {
      if (response.status === 401) {
        console.log('Unauthorized - redirecting to login');
        // Redirect to login
      } else if (response.status === 403) {
        console.log('Access forbidden - device compliance issue');
        // Show device compliance message
      } else if (response.status === 429) {
        console.log('Too many requests - rate limited');
        // Show rate limit message
      }
      throw new Error(response.error);
    }

    return response.data;
  } catch (error) {
    console.error('Request failed:', error);
    // Show user-friendly error message
  }
}
`;

/**
 * EXAMPLE: Accessing Device Context in Components
 *
 * Shows how to access stored device context information.
 */
export const exampleAccessContext = `
import { useEffect, useState } from 'react';
import { 
  getStoredDevicePosture, 
  getStoredAccessContext 
} from '@/lib/deviceContext';

export function DeviceContextDisplay() {
  const [devicePosture, setDevicePosture] = useState<any>(null);
  const [accessContext, setAccessContext] = useState<any>(null);

  useEffect(() => {
    setDevicePosture(getStoredDevicePosture());
    setAccessContext(getStoredAccessContext());
  }, []);

  return (
    <div>
      <h2>Device Context Information</h2>

      <h3>Device Posture</h3>
      <ul>
        <li>OS: {devicePosture?.os} {devicePosture?.osVersion}</li>
        <li>Browser: {devicePosture?.browser}</li>
        <li>Screen: {devicePosture?.screenResolution}</li>
        <li>Antivirus: {devicePosture?.antivirus ? 'Yes' : 'No'}</li>
        <li>Encryption: {devicePosture?.diskEncrypted ? 'Yes' : 'No'}</li>
      </ul>

      <h3>Access Context</h3>
      <ul>
        <li>Location: {accessContext?.city}, {accessContext?.country}</li>
        <li>IP: {accessContext?.ipAddress}</li>
        <li>VPN: {accessContext?.isVPN ? 'Yes' : 'No'}</li>
        <li>Tor: {accessContext?.isTor ? 'Yes' : 'No'}</li>
        <li>Timezone: {accessContext?.timezone}</li>
      </ul>
    </div>
  );
}
`;

/**
 * EXAMPLE: Custom API Client Configuration
 *
 * Shows how to create a custom API client with a different base URL.
 */
export const exampleCustomClient = `
import { ApiClient } from '@/lib/api';

// Create a custom client for a specific API
const analyticsApi = new ApiClient('https://analytics.example.com');

// Use it just like the default client
async function sendAnalytics(event: string) {
  const response = await analyticsApi.post('/events', {
    event,
    timestamp: new Date().toISOString()
  });

  return response.data;
}
`;

/**
 * EXAMPLE: Refresh Device Context Periodically
 *
 * Shows how to set up automatic context refresh.
 */
export const examplePeriodicRefresh = `
import { useEffect } from 'react';
import { refreshDeviceContext } from '@/lib/auth-context';

export function usePeriodicContextRefresh(intervalMs = 30 * 60 * 1000) {
  useEffect(() => {
    // Refresh immediately on mount
    refreshDeviceContext();

    // Refresh periodically
    const interval = setInterval(() => {
      console.log('Refreshing device context...');
      refreshDeviceContext().catch(err => {
        console.warn('Failed to refresh context:', err);
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
}

// Usage in a component
export function MyComponent() {
  usePeriodicContextRefresh(); // Refresh every 30 minutes

  return <div>Component with auto-refresh</div>;
}
`;

/**
 * EXAMPLE: Using Demo Overrides for Testing
 *
 * Shows how to set device context overrides for testing.
 */
export const exampleOverrides = `
import { 
  setDevicePostureOverride,
  setAccessContextOverride,
  clearOverrides 
} from '@/lib/deviceContext';

// Enable device posture override
function enableTestMode() {
  setDevicePostureOverride(true, {
    os: 'Windows',
    osVersion: 'Windows 11',
    diskEncrypted: true,
    antivirus: true,
    isJailbroken: false,
    browser: 'Chrome',
    screenResolution: '1920x1080',
    fingerprint: 'test-device-123',
    isKnownDevice: true,
    lastSecurityUpdate: new Date().toISOString()
  });

  setAccessContextOverride(true, {
    country: 'US',
    city: 'New York',
    timezone: 'America/New_York',
    isVPN: false,
    isTor: false,
    ipReputation: 85,
    ipAddress: '203.0.113.45',
    impossibleTravel: false,
    accessTime: new Date().toISOString()
  });
}

// Disable overrides and use real data
function disableTestMode() {
  clearOverrides();
}
`;
