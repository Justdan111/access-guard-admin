/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  getStoredDevicePosture,
  getStoredAccessContext,
} from "./deviceContext";

// ============================================
// API CLIENT WITH AUTOMATIC CONTEXT HEADERS
// ============================================

interface RequestConfig extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = "") {
    this.baseURL = baseURL;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add device posture header
    const devicePosture = getStoredDevicePosture();
    if (devicePosture) {
      headers["x-device-posture"] = JSON.stringify(devicePosture);
    }

    // Add access context header
    const accessContext = getStoredAccessContext();
    if (accessContext) {
      headers["x-access-context"] = JSON.stringify(accessContext);
    }

    // Add authorization token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: response.ok ? undefined : data?.error || "Request failed",
    };
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith("http")) {
      return endpoint;
    }
    return this.baseURL + endpoint;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`📤 ${options.method || "GET"} ${endpoint}`, {
        status: response.status,
        devicePosture: getStoredDevicePosture(),
        accessContext: getStoredAccessContext(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`❌ Request failed: ${endpoint}`, error);
      return {
        ok: false,
        status: 0,
        data: null as any,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async get<T = any>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

// Create and export default API client
const api = new ApiClient(process.env.NEXT_PUBLIC_API_BASE_URL || "");

export default api;
export { ApiClient };
export type { ApiResponse };
