'use client';

import { getStoredDeviceContext } from '@/lib/device-context';

/**
 * API Service with automatic device context header injection
 * Call this to make authenticated requests with device context
 */

interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  credentials?: RequestCredentials;
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  credentials?: RequestCredentials;
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '') {
    this.baseURL = baseURL;
  }

  /**
   * Build full URL
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) return endpoint;
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Inject device context and auth token into headers
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // Add JWT token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add device context headers
    const deviceContext = getStoredDeviceContext();
    if (deviceContext) {
      headers['x-device-posture'] = JSON.stringify(deviceContext.devicePosture);
      headers['x-access-context'] = JSON.stringify(deviceContext.accessContext);

      const url = this.buildUrl(customHeaders ? 'unknown' : '');
      console.log('📤 Request with device context:', {
        url,
        devicePosture: deviceContext.devicePosture,
        accessContext: deviceContext.accessContext,
      });
    }

    return headers;
  }

  /**
   * Generic fetch method with context injection
   */
  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options.headers);

    const config: RequestConfig = {
      method: options.method || 'GET',
      headers,
      credentials: options.credentials || 'include',
    };

    if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      // Handle MFA required (401 with mfaRequired flag)
      if (response.status === 401) {
        const data = await response.json();
        if (data.mfaRequired) {
          console.warn('⚠️ MFA Required');
          // Trigger MFA modal or flow
          throw new Error('MFA_REQUIRED');
        }
      }

      // Handle access blocked (403)
      if (response.status === 403) {
        const data = await response.json();
        console.error('🚫 Access Blocked:', data);
        // Clear auth and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        throw new Error('ACCESS_DENIED');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('❌ API Request Failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Default API client instance
const api = new ApiClient();
export default api;
