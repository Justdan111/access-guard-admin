# Backend Integration Guide - Device Context Headers

This guide explains how to integrate and validate device context headers from the frontend in your backend API.

## 📨 Understanding the Headers

Your frontend will send two custom headers with every request:

### Header 1: `x-device-posture`

```json
{
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
```

### Header 2: `x-access-context`

```json
{
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
```

## 🔍 Extracting Headers

### Example: Express.js / Node.js

```typescript
import express, { Request, Response, NextFunction } from "express";

interface DevicePosture {
  diskEncrypted: boolean;
  antivirus: boolean;
  osVersion: string;
  os: string;
  isJailbroken: boolean;
  fingerprint: string;
  isKnownDevice: boolean;
  browser: string;
  screenResolution: string;
  lastSecurityUpdate: string;
}

interface AccessContext {
  impossibleTravel: boolean;
  country: string;
  city: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  isVPN: boolean;
  isTor: boolean;
  ipAddress: string;
  ipReputation: number;
  accessTime: string;
}

// Middleware to extract and validate device context
export function deviceContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract headers
    const devicePostureHeader = req.headers["x-device-posture"];
    const accessContextHeader = req.headers["x-access-context"];

    // Parse JSON headers
    let devicePosture: DevicePosture | null = null;
    let accessContext: AccessContext | null = null;

    if (typeof devicePostureHeader === "string") {
      devicePosture = JSON.parse(devicePostureHeader);
    }

    if (typeof accessContextHeader === "string") {
      accessContext = JSON.parse(accessContextHeader);
    }

    // Attach to request object
    (req as any).devicePosture = devicePosture;
    (req as any).accessContext = accessContext;

    console.log("📱 Device Context:", {
      devicePosture,
      accessContext,
    });

    next();
  } catch (error) {
    console.error("Failed to parse device context headers:", error);
    // Continue anyway - context is optional
    next();
  }
}

// Use middleware
const app = express();
app.use(deviceContextMiddleware);
```

### Example: Fastify

```typescript
import fastify, { FastifyInstance, FastifyRequest } from "fastify";

export async function setupDeviceContextPlugin(app: FastifyInstance) {
  app.addHook("preHandler", async (request: FastifyRequest) => {
    try {
      const devicePostureHeader = request.headers["x-device-posture"];
      const accessContextHeader = request.headers["x-access-context"];

      if (typeof devicePostureHeader === "string") {
        (request as any).devicePosture = JSON.parse(devicePostureHeader);
      }

      if (typeof accessContextHeader === "string") {
        (request as any).accessContext = JSON.parse(accessContextHeader);
      }
    } catch (error) {
      console.error("Failed to parse device context:", error);
    }
  });
}
```

### Example: NestJS

```typescript
import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class DeviceContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const devicePostureHeader = req.headers["x-device-posture"];
      const accessContextHeader = req.headers["x-access-context"];

      if (typeof devicePostureHeader === "string") {
        req.devicePosture = JSON.parse(devicePostureHeader);
      }

      if (typeof accessContextHeader === "string") {
        req.accessContext = JSON.parse(accessContextHeader);
      }

      next();
    } catch (error) {
      throw new HttpException(
        "Invalid device context headers",
        HttpStatus.BAD_REQUEST
      );
    }
  }
}

// Register in module
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DeviceContextMiddleware).forRoutes("*");
  }
}
```

## ✅ Validation Examples

### 1. Enforce Device Compliance

```typescript
function validateDeviceCompliance(devicePosture: DevicePosture): {
  compliant: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // Check encryption
  if (!devicePosture.diskEncrypted) {
    violations.push("Disk encryption not enabled");
  }

  // Check antivirus
  if (!devicePosture.antivirus) {
    violations.push("Antivirus not active");
  }

  // Check jailbreak
  if (devicePosture.isJailbroken) {
    violations.push("Device is jailbroken/rooted");
  }

  // Check OS version (example)
  if (devicePosture.osVersion.includes("Windows 7")) {
    violations.push("Unsupported OS version");
  }

  return {
    compliant: violations.length === 0,
    violations,
  };
}

// Usage in route handler
app.get("/api/banking/dashboard", (req: any, res) => {
  if (!req.devicePosture) {
    return res.status(400).json({ error: "Device context required" });
  }

  const { compliant, violations } = validateDeviceCompliance(req.devicePosture);

  if (!compliant) {
    return res.status(403).json({
      error: "Device does not meet compliance requirements",
      violations,
    });
  }

  // Proceed with request
  res.json({ data: "sensitive data" });
});
```

### 2. Detect Anomalous Access

```typescript
async function detectAnomalousAccess(
  userId: string,
  accessContext: AccessContext
): Promise<{
  suspicious: boolean;
  riskFactors: string[];
}> {
  const riskFactors: string[] = [];

  // Check VPN usage
  if (accessContext.isVPN) {
    riskFactors.push("Access via VPN");
  }

  // Check Tor usage
  if (accessContext.isTor) {
    riskFactors.push("Access via Tor");
  }

  // Check impossible travel
  if (accessContext.impossibleTravel) {
    riskFactors.push("Impossible travel detected");
  }

  // Check IP reputation
  if (accessContext.ipReputation < 30) {
    riskFactors.push("Low IP reputation");
  }

  // Check for restricted countries (example)
  const restrictedCountries = ["XX", "YY"];
  if (restrictedCountries.includes(accessContext.country)) {
    riskFactors.push(
      `Access from restricted country: ${accessContext.country}`
    );
  }

  return {
    suspicious: riskFactors.length > 1,
    riskFactors,
  };
}

// Usage
app.get("/api/transactions", async (req: any, res) => {
  const { suspicious, riskFactors } = await detectAnomalousAccess(
    req.user.id,
    req.accessContext
  );

  if (suspicious) {
    // Trigger MFA
    return res.status(401).json({
      error: "MFA required",
      mfaRequired: true,
      riskFactors,
    });
  }

  res.json({ transactions: [] });
});
```

### 3. Implement Adaptive MFA

```typescript
interface MFAPolicy {
  alwaysRequired: boolean;
  requireOnNewDevice: boolean;
  requireOnUnknownLocation: boolean;
  requireOnSuspiciousAccess: boolean;
  requireOnHighValueTransaction: boolean;
}

async function shouldRequireMFA(
  user: any,
  devicePosture: DevicePosture,
  accessContext: AccessContext
): Promise<boolean> {
  const policy: MFAPolicy = {
    alwaysRequired: false,
    requireOnNewDevice: true,
    requireOnUnknownLocation: true,
    requireOnSuspiciousAccess: true,
    requireOnHighValueTransaction: true,
  };

  // Always require for sensitive operations
  if (policy.alwaysRequired) return true;

  // New device
  if (policy.requireOnNewDevice && !devicePosture.isKnownDevice) {
    console.log("MFA required: New device detected");
    return true;
  }

  // Get last known location
  const lastLocation = await getLastKnownLocation(user.id);
  const isKnownLocation =
    lastLocation && lastLocation.country === accessContext.country;

  // Unknown location
  if (policy.requireOnUnknownLocation && !isKnownLocation) {
    console.log("MFA required: Unknown location");
    return true;
  }

  // Suspicious access
  const { suspicious } = await detectAnomalousAccess(user.id, accessContext);
  if (policy.requireOnSuspiciousAccess && suspicious) {
    console.log("MFA required: Suspicious access detected");
    return true;
  }

  return false;
}

// Usage in login flow
app.post("/api/auth/login", async (req: any, res) => {
  const { username, password } = req.body;

  // Verify credentials
  const user = await authenticateUser(username, password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Check MFA requirement
  const mfaRequired = await shouldRequireMFA(
    user,
    req.devicePosture,
    req.accessContext
  );

  if (mfaRequired) {
    return res.status(401).json({
      error: "MFA required",
      mfaRequired: true,
      sessionToken: generateTemporaryToken(user.id),
    });
  }

  // Generate session token
  const token = generateAuthToken(user);

  res.json({
    success: true,
    token,
    user,
  });
});
```

### 4. Track Device Fingerprints

```typescript
interface StoredDevice {
  userId: string;
  fingerprint: string;
  os: string;
  browser: string;
  lastAccess: Date;
  trustLevel: "trusted" | "unverified" | "blocked";
}

async function trackDevice(
  userId: string,
  devicePosture: DevicePosture
): Promise<{ isNew: boolean; trustLevel: string }> {
  // Check if device exists
  const existingDevice = await db.devices.findOne({
    userId,
    fingerprint: devicePosture.fingerprint,
  });

  if (existingDevice) {
    // Update last access
    await db.devices.updateOne(
      { _id: existingDevice._id },
      { lastAccess: new Date() }
    );

    return {
      isNew: false,
      trustLevel: existingDevice.trustLevel,
    };
  }

  // New device
  const newDevice: StoredDevice = {
    userId,
    fingerprint: devicePosture.fingerprint,
    os: devicePosture.os,
    browser: devicePosture.browser,
    lastAccess: new Date(),
    trustLevel: "unverified",
  };

  await db.devices.insertOne(newDevice);

  return {
    isNew: true,
    trustLevel: "unverified",
  };
}
```

### 5. Calculate Risk Score

```typescript
interface RiskScore {
  score: number; // 0-100
  level: "low" | "medium" | "high" | "critical";
  factors: string[];
}

function calculateRiskScore(
  devicePosture: DevicePosture,
  accessContext: AccessContext
): RiskScore {
  let score = 0;
  const factors: string[] = [];

  // Device posture factors
  if (!devicePosture.diskEncrypted) {
    score += 10;
    factors.push("Disk not encrypted");
  }

  if (!devicePosture.antivirus) {
    score += 10;
    factors.push("Antivirus not active");
  }

  if (devicePosture.isJailbroken) {
    score += 20;
    factors.push("Jailbroken/rooted device");
  }

  // Access context factors
  if (accessContext.isVPN) {
    score += 5;
    factors.push("VPN detected");
  }

  if (accessContext.isTor) {
    score += 30;
    factors.push("Tor network detected");
  }

  if (accessContext.impossibleTravel) {
    score += 25;
    factors.push("Impossible travel detected");
  }

  if (accessContext.ipReputation < 30) {
    score += 20;
    factors.push("Low IP reputation");
  }

  if (!devicePosture.isKnownDevice) {
    score += 15;
    factors.push("Unknown device");
  }

  // Determine risk level
  let level: "low" | "medium" | "high" | "critical" = "low";
  if (score >= 70) level = "critical";
  else if (score >= 50) level = "high";
  else if (score >= 30) level = "medium";

  return {
    score: Math.min(score, 100),
    level,
    factors,
  };
}

// Usage
app.get("/api/sensitive-operation", (req: any, res) => {
  const riskScore = calculateRiskScore(req.devicePosture, req.accessContext);

  console.log(`Risk Score: ${riskScore.score}/100 (${riskScore.level})`);

  if (riskScore.level === "critical") {
    return res.status(403).json({
      error: "Access denied due to high risk",
      riskScore,
    });
  }

  res.json({ data: "operation successful" });
});
```

## 📊 Logging and Monitoring

### Log Device Context on Every Request

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "access.log" })],
});

app.use((req: any, res: any, next: any) => {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    logger.info({
      timestamp: new Date().toISOString(),
      userId: req.user?.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      devicePosture: req.devicePosture,
      accessContext: req.accessContext,
    });

    return originalJson(data);
  };

  next();
});
```

### Create Security Alerts

```typescript
async function checkSecurityAlerts(
  userId: string,
  devicePosture: DevicePosture,
  accessContext: AccessContext
): Promise<void> {
  // Alert on new device
  if (!devicePosture.isKnownDevice) {
    await sendSecurityAlert(userId, {
      type: "NEW_DEVICE",
      device: `${devicePosture.os} - ${devicePosture.browser}`,
      timestamp: new Date(),
    });
  }

  // Alert on impossible travel
  if (accessContext.impossibleTravel) {
    await sendSecurityAlert(userId, {
      type: "IMPOSSIBLE_TRAVEL",
      location: `${accessContext.city}, ${accessContext.country}`,
      timestamp: new Date(),
    });
  }

  // Alert on Tor usage
  if (accessContext.isTor) {
    await sendSecurityAlert(userId, {
      type: "TOR_DETECTED",
      ip: accessContext.ipAddress,
      timestamp: new Date(),
    });
  }
}
```

## 🔐 Best Practices

1. **Validate on Every Request**: Don't trust that headers are always present
2. **Log Everything**: Keep audit trails for compliance
3. **Implement Graceful Degradation**: Don't fail if context is missing
4. **Use Risk Scoring**: Combine multiple factors for decisions
5. **Implement Adaptive MFA**: Require MFA based on risk level
6. **Monitor for Patterns**: Set up alerts for suspicious patterns
7. **Regular Reviews**: Periodically review risk thresholds
8. **Cache Device Info**: Store known devices to reduce false positives
9. **Implement Rate Limiting**: Protect against brute force attempts
10. **Document Policies**: Make security policies transparent to users

## 🎯 Quick Integration Checklist

- [ ] Extract device context headers in middleware
- [ ] Parse and validate JSON headers
- [ ] Implement device compliance validation
- [ ] Implement anomalous access detection
- [ ] Implement adaptive MFA logic
- [ ] Track device fingerprints
- [ ] Calculate risk scores
- [ ] Set up logging and monitoring
- [ ] Create security alerts
- [ ] Test with various device types
- [ ] Document your policies
- [ ] Implement rate limiting
- [ ] Set up compliance reporting
