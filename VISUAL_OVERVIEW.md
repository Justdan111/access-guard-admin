# Device Context System - Visual Overview

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER AUTHENTICATION                         │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Login Page  │
                    └──────────────┘
                           │
                    POST /api/auth/login
                           │
                           ▼
                    ┌──────────────┐
                    │  Backend OK  │
                    │ Return Token │
                    └──────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
            Store Token    collectDeviceContext()
            Store User            │
                          ┌───────┴───────┐
                          ▼               ▼
                   collectDevice    collectAccess
                    Posture          Context
                          │               │
                    ┌─────┴─────┐  ┌─────┴─────┐
                    │   OS      │  │   IP      │
                    │ Browser   │  │ Location  │
                    │ Fingerprint│  │ VPN       │
                    │ etc...    │  │ Tor, etc  │
                    └───────────┘  └───────────┘
                          │               │
                    ┌─────┴───────────────┘
                    │
                    ▼
         Store in localStorage:
         - devicePosture
         - accessContext
         - (combined as deviceContext)
                    │
                    ▼
         ┌─────────────────────────┐
         │  User on Dashboard      │
         └─────────────────────────┘
                    │
         Make API call via api-client
                    │
      ┌─────────────┴─────────────┐
      │                           │
      ▼                           ▼
  Read from              Build Headers
  localStorage      - Authorization: Bearer
      │             - x-device-posture: {...}
      │             - x-access-context: {...}
      │                           │
      └─────────────┬─────────────┘
                    │
                    ▼
            ┌──────────────────┐
            │  Send Request    │
            │ with all headers │
            └──────────────────┘
                    │
                    ▼
         ┌──────────────────────────┐
         │  Backend Receives        │
         │  - Extracts headers      │
         │  - Assesses risk         │
         │  - Returns response      │
         └──────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
      200        401+MFA       403
      OK      (Need MFA)      Blocked
```

---

## 🔄 Data Flow Diagram

```
DEVICE POSTURE COLLECTION
├─ userAgent parsing
│  ├─ Detect OS (Windows, MacOS, Linux, iOS, Android)
│  ├─ Extract version (Windows 11, MacOS 14.1, etc.)
│  └─ Detect browser (Chrome, Firefox, Safari, Edge)
├─ Generate fingerprint
│  ├─ Canvas fingerprinting
│  ├─ Combine with userAgent, language, screen info
│  └─ Base64 encode for 32-char ID
├─ Screen resolution (window.screen.width/height)
├─ Device fingerprint known? (check localStorage)
├─ OS-based guesses
│  ├─ diskEncrypted (based on OS)
│  └─ antivirus (based on OS)
└─ Jailbreak detection (basic heuristics)

ACCESS CONTEXT COLLECTION
├─ Browser timezone (Intl.DateTimeFormat)
├─ IP Geolocation API
│  ├─ Try: ipapi.co/json/
│  └─ Fallback: api.ipify.org
│  ├─ Extract: country, city, timezone, IP
│  └─ Extract: threat/reputation info
├─ VPN Detection
│  ├─ Check IP API response (vpn, proxy flags)
│  ├─ WebRTC ice candidate analysis
│  └─ Timezone mismatch check
├─ Browser Geolocation
│  ├─ Request user permission
│  ├─ Get: latitude, longitude
│  └─ Timeout: 5 seconds
├─ Impossible Travel Check
│  ├─ Compare current location to previous
│  ├─ Calculate distance (Haversine formula)
│  ├─ Check time elapsed
│  └─ Flag if >500km in <2 hours
└─ Compile final context with timestamps

STORAGE
├─ localStorage['devicePosture'] (indefinite cache)
├─ localStorage['accessContext'] (1 hour cache)
├─ localStorage['accessContextTime'] (cache timestamp)
├─ localStorage['deviceFingerprint'] (persistent)
├─ localStorage['knownDevices'] (device list)
├─ localStorage['lastLocation'] (for travel check)
└─ localStorage['deviceContext'] (combined)

API INTEGRATION
├─ On each request via api-client.ts
├─ Read from localStorage
├─ Parse device and access context
├─ Create headers:
│  ├─ x-device-posture: JSON string
│  └─ x-access-context: JSON string
└─ Attach to fetch request

BACKEND PROCESSING
├─ Extract headers
├─ Parse JSON
├─ Run risk assessment
│  ├─ Check device posture (encryption, antivirus, etc.)
│  ├─ Check access context (VPN, location, reputation)
│  ├─ Compare to user profile
│  └─ Calculate risk score
├─ Make decision:
│  ├─ Low: 200 OK
│  ├─ Medium: 401 + {mfaRequired: true}
│  └─ High: 403 Forbidden
└─ Log for audit trail
```

---

## 📊 Header Structure Example

```
REQUEST HEADERS:
┌────────────────────────────────────────┐
│ Authorization: Bearer eyJhbGc...      │
│ Content-Type: application/json        │
│                                        │
│ x-device-posture:                     │
│ {                                      │
│   "diskEncrypted": true,              │
│   "antivirus": true,                  │
│   "osVersion": "Windows 11",          │
│   "os": "Windows",                    │
│   "isJailbroken": false,              │
│   "fingerprint": "abc123def456",      │
│   "isKnownDevice": true,              │
│   "browser": "Chrome",                │
│   "screenResolution": "1920x1080",    │
│   "lastSecurityUpdate": "2025-11-27T" │
│ }                                      │
│                                        │
│ x-access-context:                     │
│ {                                      │
│   "impossibleTravel": false,          │
│   "country": "NG",                    │
│   "city": "Lagos",                    │
│   "latitude": 6.5244,                 │
│   "longitude": 3.3792,                │
│   "timezone": "Africa/Lagos",         │
│   "isVPN": false,                     │
│   "isTor": false,                     │
│   "ipAddress": "203.0.113.42",        │
│   "ipReputation": 85,                 │
│   "accessTime": "2025-11-27T10:30"    │
│ }                                      │
└────────────────────────────────────────┘
```

---

## 🎯 Risk Assessment Flow

```
USER REQUEST
    │
    ▼
EXTRACT DEVICE CONTEXT
├─ Device Posture
└─ Access Context
    │
    ▼
ASSESS RISK FACTORS
│
├─ DEVICE POSTURE CHECKS
│  ├─ Unknown device? (+15 points)
│  ├─ Jailbroken? (+25 points)
│  ├─ No encryption? (+10 points)
│  ├─ No antivirus? (+10 points)
│  ├─ Outdated OS? (+20 points)
│  └─ Score: 0-100
│
├─ ACCESS CONTEXT CHECKS
│  ├─ Impossible travel? (+50 points - BLOCK)
│  ├─ VPN detected? (+15 points)
│  ├─ Tor detected? (+30 points - BLOCK)
│  ├─ Low rep IP? (+20 points)
│  ├─ New country? (+20 points)
│  └─ Unknown fingerprint? (+10 points)
│
▼
CALCULATE TOTAL RISK SCORE
│
├─ 0-19: LOW (Allow)
├─ 20-34: MEDIUM (May require MFA)
├─ 35-49: HIGH (Require MFA)
└─ 50+: CRITICAL (Block)
    │
    ▼
RETURN RESPONSE
├─ LOW: 200 OK
├─ MEDIUM: 401 + {mfaRequired: true}
├─ HIGH: 401 + {mfaRequired: true}
└─ CRITICAL: 403 Forbidden
```

---

## 🗂️ File Organization

```
accessguard-admin/
│
├── src/
│   ├── lib/
│   │   ├── device-context.ts (NEW - 500+ lines)
│   │   ├── auth-utils.ts
│   │   └── types.ts
│   │
│   ├── services/
│   │   ├── api-client.ts (NEW - 180+ lines)
│   │   └── ...
│   │
│   ├── components/
│   │   ├── device-context-example.tsx (NEW)
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── use-auth.ts (MODIFIED)
│   │   └── ...
│   │
│   └── app/
│       ├── login/page.tsx (MODIFIED)
│       ├── signup/page.tsx (MODIFIED)
│       └── ...
│
├── Documentation/
│   ├── README_DEVICE_CONTEXT.md (NEW - Main overview)
│   ├── DEVICE_CONTEXT_SETUP.md (NEW - Detailed setup)
│   ├── DEVICE_CONTEXT_QUICK_REF.md (NEW - Quick ref)
│   ├── BACKEND_DEVICE_CONTEXT_INTEGRATION.ts (NEW)
│   ├── IMPLEMENTATION_SUMMARY.md (NEW)
│   ├── INTEGRATION_CHECKLIST.md (NEW)
│   └── This file (NEW)
│
└── package.json (unchanged - no new dependencies)
```

---

## 🔗 Integration Points

```
LOGIN/SIGNUP FLOW
    │
    ├─→ Frontend stores token
    │
    ├─→ collectDeviceContext()
    │   ├─→ collectDevicePosture()
    │   ├─→ collectAccessContext()
    │   └─→ Store in localStorage
    │
    ▼
DASHBOARD/APP PAGES
    │
    ├─→ Make API calls
    │
    ├─→ Use api-client.ts
    │   ├─→ Read context from localStorage
    │   ├─→ Build request headers
    │   ├─→ Add Authorization header
    │   ├─→ Add x-device-posture header
    │   ├─→ Add x-access-context header
    │   └─→ Send request
    │
    ▼
BACKEND API ROUTES
    │
    ├─→ Extract x-device-posture header
    │
    ├─→ Extract x-access-context header
    │
    ├─→ Parse JSON
    │
    ├─→ Run risk assessment
    │
    ├─→ Decide: Allow/MFA/Block
    │
    └─→ Return response
```

---

## 📱 localStorage Structure

```
After successful login:

localStorage = {
  auth_token: "eyJhbGc...",
  user: "{\"id\":\"123\",\"email\":\"...}",
  
  // Device context (collected by collectDeviceContext)
  deviceContext: "{
    \"devicePosture\": {...},
    \"accessContext\": {...},
    \"collectedAt\": \"2025-11-27T...\"
  }",
  
  // Device posture (cached)
  devicePosture: "{...}",
  
  // Access context (cached with timestamp)
  accessContext: "{...}",
  accessContextTime: "1732707000000",
  
  // Device tracking
  deviceFingerprint: "abc123def456",
  knownDevices: "[\"abc123\", \"xyz789\"]",
  lastLocation: "{\"latitude\":6.5,\"longitude\":3.4,...}"
}
```

---

## ⚙️ Configuration Options

```typescript
// In src/lib/device-context.ts

// 1. Cache duration for access context
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// 2. Impossible travel threshold
const TRAVEL_DISTANCE_KM = 500;
const TRAVEL_TIME_HOURS = 2;

// 3. Geolocation timeout
const GEO_TIMEOUT_MS = 5000;

// 4. WebRTC detection timeout
const WEBRTC_TIMEOUT_MS = 2000;

// 5. IP geolocation API
// Primary: ipapi.co
// Fallback: api.ipify.org
```

---

## 🚀 Deployment Checklist

- [ ] Test in development environment
- [ ] Verify headers in DevTools
- [ ] Test all API endpoints
- [ ] Implement backend header reading
- [ ] Implement risk assessment
- [ ] Test MFA flow
- [ ] Test access blocking
- [ ] Load test for performance
- [ ] Security audit
- [ ] Deploy to staging
- [ ] Monitor for issues
- [ ] Deploy to production

---

## 📈 Metrics to Monitor

```
After deployment, track:

1. Collection Rate
   └─ % of users with device context collected

2. Header Presence
   └─ % of requests with device context headers

3. Risk Distribution
   ├─ % LOW risk logins
   ├─ % MEDIUM risk logins
   ├─ % HIGH risk logins
   └─ % CRITICAL risk logins

4. Performance Impact
   ├─ Average request time
   ├─ API response time
   └─ Database query time

5. User Impact
   ├─ MFA challenges per day
   ├─ Access blocks per day
   └─ User complaints about access
```

---

This visual overview covers the entire system architecture, data flow, and integration points. Refer to the detailed documentation files for implementation specifics!
