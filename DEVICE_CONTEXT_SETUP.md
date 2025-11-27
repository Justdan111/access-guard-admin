# Device Context Collection System

This system automatically collects device and access context information during user login/signup and stores it in localStorage for use in API requests.

## Files Created/Modified

### 1. **`src/lib/device-context.ts`** (NEW)
Core device context collection utility with interfaces and functions.

**Key Exports:**
- `collectDevicePosture()` - Collects device information (OS, browser, fingerprint, etc.)
- `collectAccessContext()` - Collects access information (IP, location, VPN detection, etc.)
- `collectDeviceContext()` - Main entry point that collects both and stores in localStorage
- `getStoredDeviceContext()` - Retrieve stored context
- `clearDeviceContext()` - Clear all stored context (called on logout)

### 2. **`src/services/api-client.ts`** (NEW)
API client with automatic device context header injection.

**Features:**
- Automatically injects `x-device-posture` and `x-access-context` headers
- Adds JWT token to `Authorization` header
- Handles error responses (MFA required, access denied, etc.)
- Methods: `get()`, `post()`, `put()`, `patch()`, `delete()`

### 3. **`src/app/login/page.tsx`** (MODIFIED)
Updated to collect device context after successful login.

### 4. **`src/app/signup/page.tsx`** (MODIFIED)
Updated to collect device context after successful signup.

### 5. **`src/hooks/use-auth.ts`** (MODIFIED)
Updated `logout()` to clear device context.

---

## Data Collected

### Device Posture
```typescript
{
  diskEncrypted: boolean;           // OS-based guess
  antivirus: boolean;               // OS-based guess
  osVersion: string;                // e.g., "Windows 10/11"
  os: string;                       // e.g., "Windows"
  isJailbroken: boolean;            // Basic detection
  fingerprint: string;              // Unique device ID
  isKnownDevice: boolean;           // Tracked in localStorage
  browser: string;                  // e.g., "Chrome"
  screenResolution: string;         // e.g., "1920x1080"
  lastSecurityUpdate: string;       // ISO timestamp
}
```

### Access Context
```typescript
{
  impossibleTravel: boolean;        // Travel distance check
  country: string;                  // From IP geolocation
  city: string;                     // From IP geolocation
  latitude?: number;                // From browser geolocation
  longitude?: number;               // From browser geolocation
  timezone: string;                 // Browser timezone
  isVPN: boolean;                   // WebRTC + IP detection
  isTor: boolean;                   // From IP API
  ipAddress: string;                // Real IP address
  ipReputation: number;             // 0-100 score
  accessTime: string;               // ISO timestamp
}
```

---

## Usage Examples

### 1. **Automatic Device Context in API Calls**

```typescript
import api from '@/services/api-client';

// Device context is automatically added to headers
const response = await api.get('/api/banking/dashboard');
const data = await api.post('/api/transactions', { amount: 100 });
```

### 2. **Manual Access to Stored Context**

```typescript
import { getStoredDeviceContext, clearDeviceContext } from '@/lib/device-context';

// Get the stored context
const context = getStoredDeviceContext();
console.log(context?.devicePosture.fingerprint);

// Clear on logout
clearDeviceContext();
```

### 3. **Request Headers Sent**

All requests through `api-client.ts` will include:

```
Authorization: Bearer <jwt_token>
x-device-posture: {"diskEncrypted":true,"antivirus":true,"os":"MacOS",...}
x-access-context: {"country":"NG","city":"Lagos","isVPN":false,...}
```

### 4. **Example Component Using API Client**

```typescript
'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api-client';

interface DashboardData {
  balance: number;
  transactions: any[];
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // Device context is automatically added
      const result = await api.get<DashboardData>('/api/banking/dashboard');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Balance: {data?.balance}</p>
      <p>Transactions: {data?.transactions.length}</p>
    </div>
  );
}
```

---

## Flow Diagram

```
User Login/Signup
    ↓
Submit credentials → /api/auth/login
    ↓
Receive auth token & user info
    ↓
Store token & user in localStorage
    ↓
Call collectDeviceContext()
    ├── collectDevicePosture()
    │   └── Detect OS, browser, fingerprint, etc.
    ├── collectAccessContext()
    │   └── Get IP info, detect VPN, check travel
    └── Store all in localStorage as 'deviceContext'
    ↓
Redirect to dashboard
    ↓
All API calls via api-client.ts
    └── Automatically injects device context headers
```

---

## Caching

- **Device Posture**: Cached indefinitely (device doesn't change during session)
- **Access Context**: Cached for 1 hour (location might change)
- **Device Fingerprint**: Cached indefinitely (persists across sessions)
- **Known Devices**: Tracked in localStorage

---

## Testing in Postman

Even if not using the `api-client`, you can manually test by adding headers:

```
POST /api/banking/dashboard
Authorization: Bearer <token>
x-device-posture: {"diskEncrypted":true,"antivirus":true,"osVersion":"Windows 11","os":"Windows","isJailbroken":false,"fingerprint":"abc123","isKnownDevice":true,"browser":"Chrome","screenResolution":"1920x1080","lastSecurityUpdate":"2025-11-27T10:30:00Z"}
x-access-context: {"impossibleTravel":false,"country":"US","city":"New York","latitude":40.7128,"longitude":-74.0060,"timezone":"America/New_York","isVPN":false,"isTor":false,"ipAddress":"203.0.113.42","ipReputation":85,"accessTime":"2025-11-27T10:30:00Z"}
```

---

## Error Handling

The API client handles special responses:

1. **MFA Required (401 + mfaRequired flag)**
   - Logs warning
   - Throws `MFA_REQUIRED` error
   - Can trigger MFA modal

2. **Access Blocked (403)**
   - Clears auth tokens
   - Redirects to `/login`
   - Throws `ACCESS_DENIED` error

3. **Other HTTP Errors**
   - Extracts error message from response
   - Throws descriptive error

---

## Backend Integration

Your backend should:

1. **Extract context headers** on each request:
   ```javascript
   const devicePosture = JSON.parse(req.headers['x-device-posture'] || '{}');
   const accessContext = JSON.parse(req.headers['x-access-context'] || '{}');
   ```

2. **Apply risk assessment** based on context:
   - New fingerprint → Require additional verification
   - VPN detected → Restrict sensitive operations
   - Impossible travel → Block access
   - Low IP reputation → Elevated security

3. **Return appropriate responses**:
   - `401 + {mfaRequired: true}` → Trigger MFA
   - `403` → Block access
   - `200` → Allow access

---

## Security Considerations

✅ **Device fingerprint persists** across sessions for continuity
✅ **Context cached** to reduce API calls to geolocation services
✅ **Geolocation optional** (requires user permission, gracefully fails)
✅ **VPN detection multi-method** (IP check + WebRTC + timezone)
✅ **Context cleared on logout** to prevent leakage
✅ **All context sent in headers** (separate from body for visibility)

⚠️ **Note**: Client-side fingerprinting is not foolproof. Use server-side verification for high-security operations.

---

## Future Enhancements

- [ ] Implement proper cryptographic fingerprinting
- [ ] Add biometric detection (fingerprint, face recognition)
- [ ] Implement device binding for known devices
- [ ] Add certificate pinning for API calls
- [ ] Implement token refresh with device context re-validation
