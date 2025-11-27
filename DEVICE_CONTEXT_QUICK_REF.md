# Device Context Quick Reference

## Quick Start

### 1. **In Login/Signup** (Already Done ✅)
After user logs in, device context is automatically collected:
```typescript
// Automatically happens in handleLogin/handleSignup
await collectDeviceContext()
```

### 2. **Make API Calls**
Use the provided API client:
```typescript
import api from '@/services/api-client';

// All these automatically include device context headers
await api.get('/api/endpoint');
await api.post('/api/endpoint', { data: 'here' });
await api.put('/api/endpoint', { data: 'here' });
await api.patch('/api/endpoint', { data: 'here' });
await api.delete('/api/endpoint');
```

### 3. **On Logout** (Already Done ✅)
Device context is automatically cleared:
```typescript
logout() // Calls clearDeviceContext() internally
```

---

## What Gets Included in Headers

Every request includes these headers automatically:

```
Authorization: Bearer <auth_token>
x-device-posture: {
  "diskEncrypted": true,
  "antivirus": true,
  "osVersion": "Windows 11",
  "os": "Windows",
  "isJailbroken": false,
  "fingerprint": "abcd1234",
  "isKnownDevice": true,
  "browser": "Chrome",
  "screenResolution": "1920x1080",
  "lastSecurityUpdate": "2025-11-27T..."
}
x-access-context: {
  "impossibleTravel": false,
  "country": "NG",
  "city": "Lagos",
  "timezone": "Africa/Lagos",
  "isVPN": false,
  "isTor": false,
  "ipAddress": "203.0.113.42",
  "ipReputation": 85,
  "accessTime": "2025-11-27T..."
}
```

---

## Usage in Components

### Example 1: Simple GET Request
```typescript
'use client';
import api from '@/services/api-client';

export function MyComponent() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    const result = await api.get('/api/banking/dashboard');
    setData(result); // Device context automatically included
  };

  return <button onClick={fetchData}>Load Dashboard</button>;
}
```

### Example 2: POST with Data
```typescript
const submitTransaction = async (amount: number) => {
  try {
    const result = await api.post('/api/transactions', {
      amount,
      description: 'Payment',
    });
    console.log('Transaction successful:', result);
  } catch (error) {
    console.error('Failed:', error);
  }
};
```

### Example 3: Handle Special Errors
```typescript
try {
  await api.get('/api/sensitive-data');
} catch (error) {
  if (error instanceof Error) {
    if (error.message === 'MFA_REQUIRED') {
      // Show MFA modal
    } else if (error.message === 'ACCESS_DENIED') {
      // Already redirected to login
    } else {
      // Other error
    }
  }
}
```

---

## Manual Access to Context

If you need to access the stored context directly:

```typescript
import { getStoredDeviceContext } from '@/lib/device-context';

const context = getStoredDeviceContext();
if (context) {
  console.log('Device:', context.devicePosture.os);
  console.log('IP:', context.accessContext.ipAddress);
  console.log('Country:', context.accessContext.country);
}
```

---

## Files Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `src/lib/device-context.ts` | ✨ NEW | Core device context collection |
| `src/services/api-client.ts` | ✨ NEW | API client with auto header injection |
| `src/app/login/page.tsx` | 🔄 MODIFIED | Collect context on login |
| `src/app/signup/page.tsx` | 🔄 MODIFIED | Collect context on signup |
| `src/hooks/use-auth.ts` | 🔄 MODIFIED | Clear context on logout |
| `src/components/device-context-example.tsx` | ✨ NEW | Example usage component |

---

## Testing Checklist

- [ ] Test login flow - device context should be collected
- [ ] Open DevTools Network tab during login
- [ ] Check localStorage for `deviceContext` key after login
- [ ] Make API call via api-client
- [ ] Verify `x-device-posture` header is present
- [ ] Verify `x-access-context` header is present
- [ ] Test logout - should clear device context
- [ ] Check localStorage - `deviceContext` should be gone

---

## Troubleshooting

### Device context not collected?
- Check browser console for errors
- Verify `collectDeviceContext()` is called in login/signup
- Check if geolocation permission is blocked (optional, won't break)

### Headers not appearing?
- Verify you're using `api-client.ts` not native fetch
- Check that auth token exists
- Open DevTools Network tab before making request

### API returning 401/403?
- Check token is stored in localStorage
- Verify device context is valid JSON
- Backend should validate headers (not required though)

### VPN not detected?
- Some VPNs don't leak through WebRTC
- IP APIs might have limited accuracy
- This is expected - use for risk assessment, not blocking

---

## Backend Integration Example

Your backend should:

```javascript
// Express.js example
app.post('/api/transactions', (req, res) => {
  // Extract context from headers
  const devicePosture = JSON.parse(req.headers['x-device-posture'] || '{}');
  const accessContext = JSON.parse(req.headers['x-access-context'] || '{}');

  // Risk assessment
  let riskLevel = 'LOW';
  
  if (!devicePosture.isKnownDevice) {
    riskLevel = 'MEDIUM'; // New device
  }
  
  if (accessContext.isVPN) {
    riskLevel = 'MEDIUM'; // VPN detected
  }
  
  if (accessContext.impossibleTravel) {
    riskLevel = 'HIGH'; // Impossible travel
    return res.status(403).json({ error: 'Access blocked: Impossible travel detected' });
  }
  
  if (accessContext.ipReputation < 50) {
    riskLevel = 'HIGH'; // Low reputation IP
  }

  // Continue with business logic
  if (riskLevel === 'HIGH') {
    return res.status(401).json({ mfaRequired: true });
  }

  // Process transaction
  res.json({ success: true, ...transaction });
});
```

---

## Performance Notes

- ⚡ Device posture cached indefinitely (no polling)
- ⚡ Access context cached for 1 hour
- ⚡ Geolocation request skipped if cached
- ⚡ Minimal network overhead

---

## Security Notes

✅ All context stored locally - not sent anywhere else
✅ Context only sent in request headers - controlled
✅ Fingerprint regenerated on new device
✅ Device list tracked per browser
✅ Context cleared on logout
✅ Graceful degradation if APIs unavailable

---

## Next Steps

1. ✅ Device context system is ready to use
2. Update your backend to read the headers
3. Implement risk assessment logic
4. Add MFA flow (if not already present)
5. Monitor and refine context collection
