# Device Context Collection System

A comprehensive frontend security system that collects device posture and access context information during login and automatically includes it in all API requests.

## 📋 Overview

The system collects the following information:

### Device Posture

- Operating System (Windows, MacOS, Linux, iOS, Android)
- OS Version
- Browser type (Chrome, Firefox, Safari, Edge, Opera)
- Screen Resolution
- Device Fingerprint (unique identifier)
- Disk Encryption status
- Antivirus status
- Jailbreak detection
- Last security update timestamp

### Access Context

- Geographic location (Country, City, Coordinates)
- Timezone
- IP Address
- VPN detection
- Tor detection
- IP Reputation score
- Impossible travel detection
- Access timestamp

## 🚀 Quick Start

### 1. Authentication Flow

The device context is automatically initialized when a user logs in:

```typescript
// src/app/login/page.tsx
import { initializeDeviceContext } from "@/lib/auth-context";

const handleLogin = async (e: React.FormEvent) => {
  // ... perform login request
  const authData = await response.json();
  localStorage.setItem("auth_token", authData.token);
  localStorage.setItem("user", JSON.stringify(authData.user));

  // Initialize device context - happens automatically
  await initializeDeviceContext();

  // Redirect to dashboard
  router.push("/dashboard");
};
```

### 2. Making API Requests

Use the provided `api` client which automatically adds device context headers:

```typescript
// src/services/dashboard.ts
import api from "@/lib/api";

export async function fetchDashboard() {
  const response = await api.get("/api/banking/dashboard");
  return response.data;
}

// Headers are automatically added:
// x-device-posture: {...deviceInfo}
// x-access-context: {...locationInfo}
// Authorization: Bearer {token}
```

### 3. In React Components

```typescript
import { useEffect, useState } from "react";
import api from "@/lib/api";

export function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const response = await api.get("/api/banking/dashboard");
    if (response.ok) {
      setData(response.data);
    }
  };

  return <div>{/* render data */}</div>;
}
```

## 📁 File Structure

```
src/
├── lib/
│   ├── deviceContext.ts       # Device posture and access context collection
│   ├── api.ts                 # API client with automatic context headers
│   └── auth-context.ts        # Authentication context initialization
├── hooks/
│   └── use-auth.ts            # Updated to clear context on logout
└── app/
    └── login/
        └── page.tsx           # Updated to initialize device context
```

## 🔧 API Reference

### Device Context Collection

#### `collectDevicePosture(): Promise<Partial<DevicePosture>>`

Collects device information including OS, browser, screen resolution, etc.

```typescript
import { collectDevicePosture } from "@/lib/deviceContext";

const posture = await collectDevicePosture();
console.log(posture);
// {
//   diskEncrypted: true,
//   antivirus: true,
//   osVersion: "MacOS 14.2",
//   os: "MacOS",
//   isJailbroken: false,
//   fingerprint: "abc123...",
//   isKnownDevice: true,
//   browser: "Chrome",
//   screenResolution: "1920x1080",
//   lastSecurityUpdate: "2024-01-20T10:30:00Z"
// }
```

#### `collectAccessContext(): Promise<Partial<AccessContext>>`

Collects access and location information.

```typescript
import { collectAccessContext } from "@/lib/deviceContext";

const context = await collectAccessContext();
console.log(context);
// {
//   impossibleTravel: false,
//   country: "NG",
//   city: "Lagos",
//   latitude: 6.5244,
//   longitude: 3.3792,
//   timezone: "Africa/Lagos",
//   isVPN: false,
//   isTor: false,
//   ipAddress: "203.0.113.45",
//   ipReputation: 85,
//   accessTime: "2024-01-20T10:30:00Z"
// }
```

### Storage Functions

#### `storeDevicePosture(posture: Partial<DevicePosture>): void`

Store device posture to localStorage.

```typescript
import { storeDevicePosture } from "@/lib/deviceContext";

storeDevicePosture(devicePosture);
```

#### `getStoredDevicePosture(): Partial<DevicePosture> | null`

Retrieve stored device posture.

```typescript
import { getStoredDevicePosture } from "@/lib/deviceContext";

const posture = getStoredDevicePosture();
```

#### `storeAccessContext(context: Partial<AccessContext>): void`

Store access context to localStorage.

```typescript
import { storeAccessContext } from "@/lib/deviceContext";

storeAccessContext(accessContext);
```

#### `getStoredAccessContext(): Partial<AccessContext> | null`

Retrieve stored access context.

```typescript
import { getStoredAccessContext } from "@/lib/deviceContext";

const context = getStoredAccessContext();
```

#### `clearContexts(): void`

Clear all stored context data.

```typescript
import { clearContexts } from "@/lib/deviceContext";

clearContexts(); // Clears device posture and access context
```

### Authentication Context Functions

#### `initializeDeviceContext(): Promise<{ devicePosture, accessContext }>`

Initialize and store both device posture and access context. Called automatically on login.

```typescript
import { initializeDeviceContext } from "@/lib/auth-context";

const { devicePosture, accessContext } = await initializeDeviceContext();
```

#### `refreshDeviceContext(): Promise<{ devicePosture, accessContext }>`

Refresh device context (call periodically or on demand).

```typescript
import { refreshDeviceContext } from "@/lib/auth-context";

// Refresh context every 30 minutes
setInterval(() => {
  refreshDeviceContext();
}, 30 * 60 * 1000);
```

#### `clearDeviceContext(): void`

Clear device context. Called automatically on logout.

```typescript
import { clearDeviceContext } from "@/lib/auth-context";

clearDeviceContext();
```

### API Client

#### Basic Methods

```typescript
import api from "@/lib/api";

// GET request
const response = await api.get("/api/users");

// POST request
const response = await api.post("/api/users", { name: "John" });

// PUT request
const response = await api.put("/api/users/123", { name: "Jane" });

// PATCH request
const response = await api.patch("/api/users/123", { role: "admin" });

// DELETE request
const response = await api.delete("/api/users/123");
```

#### Response Structure

All API methods return an `ApiResponse<T>` object:

```typescript
interface ApiResponse<T> {
  ok: boolean; // true if status 2xx
  status: number; // HTTP status code
  data: T; // Response data
  error?: string; // Error message if failed
}
```

#### Example Usage

```typescript
import api from "@/lib/api";

async function fetchTransactions() {
  const response = await api.get("/api/transactions");

  if (response.ok) {
    console.log("Transactions:", response.data);
  } else {
    console.error("Error:", response.error);
  }
}
```

## 🔐 Security Headers

All requests automatically include:

```
x-device-posture: {"diskEncrypted":true,"antivirus":true,...}
x-access-context: {"impossibleTravel":false,"country":"NG",...}
Authorization: Bearer {token}
```

Your backend can validate these headers to:

- Detect compromised devices
- Block access from VPNs or Tor
- Detect impossible travel scenarios
- Validate device compliance
- Implement adaptive authentication

## 🧪 Testing & Demo Overrides

### Set Device Posture Override

```typescript
import { setDevicePostureOverride } from "@/lib/deviceContext";

setDevicePostureOverride(true, {
  os: "Windows",
  osVersion: "Windows 11",
  diskEncrypted: true,
  antivirus: true,
  isJailbroken: false,
});
```

### Set Access Context Override

```typescript
import { setAccessContextOverride } from "@/lib/deviceContext";

setAccessContextOverride(true, {
  country: "US",
  city: "New York",
  isVPN: false,
  isTor: false,
  ipReputation: 85,
});
```

### Clear Overrides

```typescript
import { clearOverrides } from "@/lib/deviceContext";

clearOverrides();
```

## 📊 What Gets Collected

### Real Data Collected ✅

- Operating System & Version
- Browser type & capabilities
- Screen resolution
- Device fingerprint (based on canvas, user agent, hardware specs)
- Timezone
- Real IP address (from ipapi.co)
- Country & City (from IP geolocation)
- VPN detection (WebRTC + IP API)
- Tor detection (from IP API)
- Geolocation coordinates (with user permission)
- Impossible travel calculation

### Estimated/Simulated ⚙️

- Disk encryption (guessed based on OS)
- Antivirus status (guessed based on OS)
- Jailbreak detection (basic heuristics)

## 🌐 External APIs Used

- **ipapi.co**: IP geolocation (1000 requests/day free)
- **api.ipify.org**: IP address fallback
- **Browser APIs**: Geolocation, Canvas, WebRTC

## 🔄 Typical Flow

```
1. User visits login page
   ↓
2. User enters credentials and submits
   ↓
3. Frontend sends login request to /api/auth/login
   ↓
4. Backend validates credentials and returns token
   ↓
5. Frontend stores token and calls initializeDeviceContext()
   ↓
6. Device context is collected and stored in localStorage
   ↓
7. API client automatically includes headers in subsequent requests
   ↓
8. Backend receives requests with device context headers
   ↓
9. Backend validates device posture and access context
   ↓
10. User is logged in and redirected to dashboard
    ↓
11. On logout, clearDeviceContext() is called to clean up
```

## 🚨 Error Handling

The system handles errors gracefully:

```typescript
try {
  await initializeDeviceContext();
} catch (error) {
  console.warn("Device context initialization failed:", error);
  // User can still proceed with login
  // Requests will be made without context headers
}
```

## ⚙️ Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Customize API Base URL

```typescript
import { ApiClient } from "@/lib/api";

const customApi = new ApiClient("https://api.example.com");
const response = await customApi.get("/users");
```

## 📝 Notes

- Device context is initialized automatically on login
- Device context is cleared automatically on logout
- Context is refreshed on each API request if available
- All external API calls have fallbacks for resilience
- Device fingerprint is persisted to detect returning devices
- Location is persisted to detect impossible travel
- Geolocation requires user permission (can be skipped)

## 🎯 Next Steps

1. Configure your backend to validate these headers
2. Implement risk scoring based on device posture
3. Implement adaptive authentication based on access context
4. Set up alerts for suspicious patterns
5. Periodically refresh device context (e.g., every 30 minutes)
