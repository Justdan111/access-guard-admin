# System Architecture Diagram

## Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Application                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────┐           ┌──────────────────────────┐  │
│  │   Login Component  │           │  Dashboard Components    │  │
│  │                    │           │  (Transactions, Users,   │  │
│  │  1. Get credentials│           │   Risk Assessment, etc)  │  │
│  │  2. POST to        │           │                          │  │
│  │     /api/auth/login│           │  All use api.get()       │  │
│  │  3. Store token    │           │     api.post()           │  │
│  │  4. Initialize     │           │     api.put()            │  │
│  │     device context │           │     api.delete()         │  │
│  │  5. Redirect       │           │                          │  │
│  └────────────────────┘           └──────────────────────────┘  │
│         │                                    │                   │
│         └────────────────┬───────────────────┘                   │
│                          │                                       │
│                          ▼                                       │
│            ┌──────────────────────────────┐                     │
│            │   API Client                 │                     │
│            │  (src/lib/api.ts)            │                     │
│            │                              │                     │
│            │  • GET, POST, PUT, PATCH     │                     │
│            │  • DELETE methods            │                     │
│            │                              │                     │
│            │  Automatically adds:         │                     │
│            │  • x-device-posture header   │                     │
│            │  • x-access-context header   │                     │
│            │  • Authorization header      │                     │
│            └──────────────────────────────┘                     │
│                          │                                       │
│                          │ All HTTP requests                    │
│                          │ include headers                      │
│                          ▼                                       │
│            ┌──────────────────────────────┐                     │
│            │ Device Context Collection    │                     │
│            │  (src/lib/deviceContext.ts)  │                     │
│            │                              │                     │
│            │ • collectDevicePosture()     │                     │
│            │   └─ OS, Browser, etc.       │                     │
│            │                              │                     │
│            │ • collectAccessContext()     │                     │
│            │   └─ Location, IP, VPN, etc. │                     │
│            │                              │                     │
│            │ • Storage functions          │                     │
│            │   └─ Store/retrieve from     │                     │
│            │      localStorage            │                     │
│            └──────────────────────────────┘                     │
│                          │                                       │
│                          │ Read stored data                     │
│                          │ every request                        │
│                          ▼                                       │
│            ┌──────────────────────────────┐                     │
│            │   localStorage               │                     │
│            │                              │                     │
│            │ • devicePosture              │                     │
│            │ • accessContext              │                     │
│            │ • auth_token                 │                     │
│            │ • user                       │                     │
│            │ • deviceFingerprint          │                     │
│            │ • knownDevices               │                     │
│            │ • lastLocation               │                     │
│            └──────────────────────────────┘                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP Request with headers
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Server                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Request Middleware                                        │  │
│  │                                                            │  │
│  │  1. Extract x-device-posture header                        │  │
│  │  2. Extract x-access-context header                        │  │
│  │  3. Parse JSON                                             │  │
│  │  4. Attach to request object                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           │                                       │
│                           ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Validation & Security Logic                              │  │
│  │                                                            │  │
│  │  • validateDeviceCompliance()                              │  │
│  │  • detectAnomalousAccess()                                 │  │
│  │  • shouldRequireMFA()                                      │  │
│  │  • trackDevice()                                           │  │
│  │  • calculateRiskScore()                                    │  │
│  │  • checkSecurityAlerts()                                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           │                                       │
│                           ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Route Handler                                             │  │
│  │                                                            │  │
│  │  Make security decision:                                   │  │
│  │  • ALLOW (200)                                             │  │
│  │  • MFA_REQUIRED (401)                                      │  │
│  │  • ACCESS_DENIED (403)                                     │  │
│  │  • RATE_LIMITED (429)                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           │                                       │
│                           ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Logging & Monitoring                                      │  │
│  │                                                            │  │
│  │  • Log all requests with context                           │  │
│  │  • Create security alerts                                  │  │
│  │  • Store audit trail                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Response
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Application                          │
│                  Receives Response                               │
│              (with or without access granted)                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
LOGIN FLOW
══════════════════════════════════════════════════════════════════

User ──► Login Page ──POST─► /api/auth/login ──► Backend
                                                      │
                                                      ▼
                                            Validate credentials
                                                      │
                                                      ▼
                                            Return JWT token
                                                      │
                        Store in localStorage ◄───── │
                                │
                        Store user profile ◄────────┘
                                │
                                ▼
                    initializeDeviceContext()
                                │
                    ┌───────────┬───────────┐
                    ▼           ▼           ▼
            collectDevice   collectAccess   Track
            Posture()       Context()       Device
                    │           │           │
                    └───────────┬───────────┘
                                ▼
                    Store in localStorage
                    (devicePosture)
                    (accessContext)
                                │
                                ▼
                        Redirect to dashboard


API REQUEST FLOW
══════════════════════════════════════════════════════════════════

Component calls api.get('/api/endpoint')
                    │
                    ▼
            ApiClient.request()
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    Retrieve   Retrieve   Get JWT
    Device     Access     Token
    Posture    Context
        │           │           │
        └───────────┼───────────┘
                    ▼
        Build HTTP Headers
        ├─ x-device-posture: {...}
        ├─ x-access-context: {...}
        ├─ Authorization: Bearer {...}
        └─ Content-Type: application/json
                    │
                    ▼
        Send fetch() request
                    │
                    ▼
        Backend receives request
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    Extract    Parse      Validate
    Headers    JSON       Compliance
        │           │           │
        └───────────┼───────────┘
                    ▼
            Calculate Risk Score
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
    Low Risk              High Risk
        │                       │
        ▼                       ▼
    Process Request      Require MFA
    Return data          or Deny Access


LOGOUT FLOW
══════════════════════════════════════════════════════════════════

User ──► Logout Button ──► useAuth().logout()
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            clearDevice        Remove Token    Remove User
            Context()          from Storage    from Storage
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
                        Redirect to Login Page
```

## Header Format Diagram

```
HTTP REQUEST TO BACKEND
═════════════════════════════════════════════════════════════════

POST /api/banking/dashboard HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

x-device-posture: {
  "diskEncrypted": true,
  "antivirus": true,
  "osVersion": "MacOS 14.2",
  "os": "MacOS",
  "isJailbroken": false,
  "fingerprint": "abc123xyz789...",
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

{}  ◄─── Request body (if applicable)
```

## Authentication Decision Tree

```
REQUEST RECEIVED WITH DEVICE CONTEXT
═════════════════════════════════════════════════════════════════

                        ┌─────────────────┐
                        │  Device Context │
                        │    Available?   │
                        └────────┬────────┘
                                 │
                        ┌────────┴────────┐
                        ▼                 ▼
                      YES                NO
                        │                 │
                        ▼                 ▼
            ┌─────────────────┐    Warn but allow
            │ Is encryption   │    (may have
            │ enabled?        │     consequences)
            └────────┬────────┘
                     │
            ┌────────┴────────┐
            ▼                 ▼
           NO                YES
            │                 │
            ▼                 ▼
    BLOCK 403         ┌─────────────────┐
    (Encryption       │ Is antivirus    │
     required)        │ active?         │
                      └────────┬────────┘
                               │
                      ┌────────┴────────┐
                      ▼                 ▼
                     NO                YES
                      │                 │
                      ▼                 ▼
                BLOCK 403         ┌──────────────────┐
                (Antivirus        │ Device known?    │
                 required)        │ (Not new device) │
                                  └────────┬─────────┘
                                           │
                                  ┌────────┴────────┐
                                  ▼                 ▼
                                 NO                YES
                                  │                 │
                                  ▼                 ▼
                        Require MFA        ┌──────────────────┐
                        (401)              │ Access from VPN  │
                                           │ or Tor?          │
                                           └────────┬─────────┘
                                                    │
                                           ┌────────┴────────┐
                                           ▼                 ▼
                                          NO               YES
                                           │                 │
                                           ▼                 ▼
                        ┌──────────────────────┐    Require MFA
                        │ Impossible Travel    │    (401)
                        │ detected?            │
                        └────────┬─────────────┘
                                 │
                        ┌────────┴────────┐
                        ▼                 ▼
                       NO               YES
                        │                 │
                        ▼                 ▼
            ┌──────────────────────┐  BLOCK 403
            │ Calculate risk score │  (Suspicious
            └────────┬─────────────┘   activity)
                     │
            ┌────────┴────────┐
            ▼                 ▼
      Low Risk          High Risk
      (0-50)            (51-100)
            │                 │
            ▼                 ▼
    ALLOW 200      Require MFA or
    (Proceed)      BLOCK (401/403)
```

## Module Dependencies

```
┌────────────────────────────────────────────────────┐
│            Components                              │
│  (Dashboard, Transactions, Users, etc.)            │
└──────────────────────┬─────────────────────────────┘
                       │
                       │ import api
                       ▼
            ┌────────────────────────┐
            │   src/lib/api.ts       │
            │   API Client           │
            └──────────────┬─────────┘
                           │
                           │ uses
                           ▼
            ┌────────────────────────────────┐
            │   src/lib/deviceContext.ts     │
            │   Device Context Collection    │
            └──────────────────┬─────────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
            localStorage            External APIs
            (browser storage)     (ipapi.co, etc.)


┌────────────────────────────────────────────────────┐
│            Login Page                              │
│  (src/app/login/page.tsx)                          │
└──────────────────────┬─────────────────────────────┘
                       │
                       │ imports
                       ▼
            ┌────────────────────────────────┐
            │   src/lib/auth-context.ts      │
            │   Auth Context Helpers         │
            └──────────────────┬─────────────┘
                               │
                               │ calls
                               ▼
            ┌────────────────────────────────┐
            │   src/lib/deviceContext.ts     │
            │   Device Context Collection    │
            └────────────────────────────────┘


┌────────────────────────────────────────────────────┐
│            useAuth Hook                            │
│  (src/hooks/use-auth.ts)                           │
└──────────────────────┬─────────────────────────────┘
                       │
                       │ imports
                       ▼
            ┌────────────────────────────────┐
            │   src/lib/auth-context.ts      │
            │   clearDeviceContext()         │
            └────────────────────────────────┘
```

## Security Decision Matrix

```
┌──────────────┬──────────────┬──────────┬──────────┬────────────┐
│ Device       │ Encryption   │ Antivirus│ Known    │ VPN/Tor    │
│ Compliance   │ Enabled      │ Active   │ Device   │ Detected   │
├──────────────┼──────────────┼──────────┼──────────┼────────────┤
│ PASS         │ ✓            │ ✓        │ ✓        │ ✗          │
│ ALLOW (200)  │              │          │          │            │
├──────────────┼──────────────┼──────────┼──────────┼────────────┤
│ WARN         │ ✓            │ ✓        │ ✗        │ ✗          │
│ MFA (401)    │              │          │ NEW      │            │
├──────────────┼──────────────┼──────────┼──────────┼────────────┤
│ ALERT        │ ✓            │ ✓        │ ✓        │ ✓          │
│ MFA (401)    │              │          │          │ VPN        │
├──────────────┼──────────────┼──────────┼──────────┼────────────┤
│ BLOCK        │ ✗            │ ?        │ ?        │ ?          │
│ DENIED (403) │ NO ENC       │          │          │            │
├──────────────┼──────────────┼──────────┼──────────┼────────────┤
│ BLOCK        │ ?            │ ✗        │ ?        │ ?          │
│ DENIED (403) │              │ NO AV    │          │            │
├──────────────┼──────────────┼──────────┼──────────┼────────────┤
│ RISK         │ ✓            │ ✓        │ ✓        │ ✗          │
│ ASSESSMENT   │              │          │          │ BUT RECENT │
│ VARYING      │              │          │          │            │
└──────────────┴──────────────┴──────────┴──────────┴────────────┘
```

---

**Legend:**

- ✓ = Present/Enabled/Good
- ✗ = Missing/Disabled/Bad
- ? = May vary
- MFA = Multi-Factor Authentication Required
- ALLOW = Request proceeds
- BLOCK = Request denied
- WARN = Additional verification required
