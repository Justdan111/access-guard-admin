# Device Context System - Quick Reference

## 📝 Quick Start (3 Steps)

### 1. Login Page ✅ (Already done)

```typescript
// Device context automatically initialized on login
import { initializeDeviceContext } from "@/lib/auth-context";

const handleLogin = async () => {
  // ... authenticate user
  await initializeDeviceContext(); // Called in login page
  router.push("/dashboard");
};
```

### 2. Use API Client

```typescript
import api from "@/lib/api";

// Device context headers are automatically added!
const response = await api.get("/api/users");
```

### 3. Backend Validation

```typescript
// Extract headers in middleware
const devicePosture = JSON.parse(req.headers["x-device-posture"]);
const accessContext = JSON.parse(req.headers["x-access-context"]);

// Validate compliance
if (!devicePosture.diskEncrypted) {
  return res.status(403).json({ error: "Encryption required" });
}
```

## 🎯 Common Use Cases

### Fetch Data

```typescript
const response = await api.get("/api/banking/dashboard");
if (response.ok) console.log(response.data);
```

### Create Resource

```typescript
const response = await api.post("/api/transactions", {
  amount: 1000,
  recipient: "john@example.com",
});
```

### Update Resource

```typescript
const response = await api.put("/api/users/123", { role: "admin" });
```

### Delete Resource

```typescript
const response = await api.delete("/api/users/123");
```

### Access Context Data

```typescript
import {
  getStoredDevicePosture,
  getStoredAccessContext,
} from "@/lib/deviceContext";

const device = getStoredDevicePosture(); // OS, browser, etc.
const access = getStoredAccessContext(); // Location, IP, VPN, etc.
```

### Refresh Context

```typescript
import { refreshDeviceContext } from "@/lib/auth-context";

refreshDeviceContext(); // Collect fresh data
```

### Logout

```typescript
import { useAuth } from "@/hooks/use-auth";

const { logout } = useAuth();
logout(); // Clears device context automatically
```

## 📊 Headers Sent With Every Request

```
x-device-posture: {
  "diskEncrypted": true,
  "antivirus": true,
  "osVersion": "MacOS 14.2",
  "os": "MacOS",
  "isJailbroken": false,
  "fingerprint": "abc123...",
  "isKnownDevice": true,
  "browser": "Chrome",
  "screenResolution": "1920x1080",
  "lastSecurityUpdate": "2024-01-20T10:30:00Z"
}

x-access-context: {
  "impossibleTravel": false,
  "country": "NG",
  "city": "Lagos",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "timezone": "Africa/Lagos",
  "isVPN": false,
  "isTor": false,
  "ipAddress": "203.0.113.45",
  "ipReputation": 85,
  "accessTime": "2024-01-20T10:30:00Z"
}

Authorization: Bearer {jwt_token}
```

## 🔑 Key Files

| File                           | Purpose                      |
| ------------------------------ | ---------------------------- |
| `src/lib/deviceContext.ts`     | Core collection functions    |
| `src/lib/api.ts`               | API client with auto headers |
| `src/lib/auth-context.ts`      | Auth context helpers         |
| `src/hooks/use-auth.ts`        | Updated logout               |
| `src/app/login/page.tsx`       | Updated login                |
| `DEVICE_CONTEXT_GUIDE.md`      | Frontend documentation       |
| `BACKEND_INTEGRATION_GUIDE.md` | Backend documentation        |

## 🧪 Testing

### Enable Demo Override

```typescript
import {
  setDevicePostureOverride,
  setAccessContextOverride,
} from "@/lib/deviceContext";

// Test with Windows device that has no encryption
setDevicePostureOverride(true, {
  os: "Windows",
  diskEncrypted: false,
});

// Test with VPN from high-risk country
setAccessContextOverride(true, {
  country: "XX",
  isVPN: true,
});
```

### Disable Demo Override

```typescript
import { clearOverrides } from "@/lib/deviceContext";

clearOverrides(); // Use real data
```

## ✅ Response Structure

All API responses have this structure:

```typescript
{
  ok: boolean           // true if status 2xx
  status: number        // HTTP status code
  data: any            // Response payload
  error?: string       // Error message if failed
}
```

### Example

```typescript
const response = await api.get("/api/users");

if (response.ok) {
  console.log("Success:", response.data);
} else {
  console.error("Error:", response.error);
}
```

## 🔍 Debug Logging

Device context automatically logs to console:

```
📤 GET /api/banking/dashboard
📱 Device Context: {devicePosture, accessContext}
```

## 🚨 Error Handling

```typescript
const response = await api.get("/api/sensitive-data");

if (response.status === 401) {
  console.log("Unauthorized");
} else if (response.status === 403) {
  console.log("Access denied - device compliance issue");
} else if (response.status === 429) {
  console.log("Rate limited");
}
```

## 🔄 Refresh Periodic Refresh

```typescript
// Set up auto-refresh in a component
useEffect(() => {
  const interval = setInterval(() => {
    refreshDeviceContext();
  }, 30 * 60 * 1000); // Every 30 minutes

  return () => clearInterval(interval);
}, []);
```

## 📋 Backend Middleware (Express Example)

```typescript
app.use((req: any, res, next) => {
  try {
    if (req.headers["x-device-posture"]) {
      req.devicePosture = JSON.parse(req.headers["x-device-posture"]);
    }
    if (req.headers["x-access-context"]) {
      req.accessContext = JSON.parse(req.headers["x-access-context"]);
    }
  } catch (err) {
    // Continue without context
  }
  next();
});
```

## 🎯 Backend Validation Examples

### Check Encryption

```typescript
if (!req.devicePosture.diskEncrypted) {
  return res.status(403).json({ error: "Encryption required" });
}
```

### Detect VPN

```typescript
if (req.accessContext.isVPN) {
  // Require MFA
  return res.status(401).json({ mfaRequired: true });
}
```

### Impossible Travel

```typescript
if (req.accessContext.impossibleTravel) {
  return res.status(403).json({ error: "Access denied" });
}
```

### Risk Score

```typescript
const riskScore = calculateRiskScore(req.devicePosture, req.accessContext);
if (riskScore > 70) {
  return res.status(403).json({ error: "High risk detected" });
}
```

## 🚀 Production Checklist

- [ ] Test with demo credentials
- [ ] Verify headers in network tab
- [ ] Backend extracts headers correctly
- [ ] Implement compliance validation
- [ ] Set up MFA triggers
- [ ] Create security alerts
- [ ] Configure logging
- [ ] Test error scenarios
- [ ] Deploy to staging
- [ ] Monitor production logs
- [ ] Handle edge cases
- [ ] Document policies

## 📞 Need Help?

1. **Frontend**: See `DEVICE_CONTEXT_GUIDE.md`
2. **Backend**: See `BACKEND_INTEGRATION_GUIDE.md`
3. **Examples**: See `src/lib/api-examples.ts`
4. **Overview**: See `IMPLEMENTATION_SUMMARY.md`

## 💡 Tips

✅ Device context is collected **once** at login  
✅ Headers are added **automatically** to all requests  
✅ Geolocation is **optional** (graceful degradation)  
✅ External APIs have **fallbacks**  
✅ Demo overrides are **testable**  
✅ All errors are **logged** to console  
✅ System **continues** even if collection fails  
✅ Data is **persistent** in localStorage

---

**Ready to use!** Just import `api` and start making requests. Device context is handled automatically. 🎉
