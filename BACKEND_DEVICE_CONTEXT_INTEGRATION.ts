// backend/src/middleware/deviceContext.ts
// Example backend middleware to handle device context headers

export interface DevicePosture {
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

export interface AccessContext {
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

export interface RiskAssessment {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 0-100
  factors: string[];
  requiresMFA: boolean;
  blockAccess: boolean;
}

/**
 * Parse and validate device context headers from request
 */
export function parseDeviceContext(
  devicePostureHeader?: string,
  accessContextHeader?: string
): { devicePosture: Partial<DevicePosture>; accessContext: Partial<AccessContext> } {
  let devicePosture = {};
  let accessContext = {};

  try {
    if (devicePostureHeader) {
      devicePosture = JSON.parse(devicePostureHeader);
    }
  } catch (e) {
    console.warn('Failed to parse device posture header:', e);
  }

  try {
    if (accessContextHeader) {
      accessContext = JSON.parse(accessContextHeader);
    }
  } catch (e) {
    console.warn('Failed to parse access context header:', e);
  }

  return { devicePosture, accessContext };
}

/**
 * Assess risk based on device context
 * Returns risk level and whether additional verification is needed
 */
export function assessRisk(
  devicePosture: Partial<DevicePosture>,
  accessContext: Partial<AccessContext>,
  userProfile: {
    id: string;
    knownFingerprints: string[];
    knownCountries: string[];
    riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  }
): RiskAssessment {
  let score = 0;
  const factors: string[] = [];
  let requiresMFA = false;
  let blockAccess = false;

  // ============================================
  // DEVICE POSTURE CHECKS
  // ============================================

  // 1. Unknown device
  if (!devicePosture.isKnownDevice) {
    score += 15;
    factors.push('Unknown device (first login)');
  }

  // 2. Jailbroken/rooted device
  if (devicePosture.isJailbroken) {
    score += 25;
    factors.push('Device is jailbroken/rooted');
    if (userProfile.riskTolerance === 'LOW') {
      requiresMFA = true;
    }
  }

  // 3. No disk encryption
  if (devicePosture.diskEncrypted === false) {
    score += 10;
    factors.push('Disk encryption not enabled');
  }

  // 4. No antivirus
  if (devicePosture.antivirus === false) {
    score += 10;
    factors.push('Antivirus not detected');
  }

  // 5. Outdated OS
  if (
    devicePosture.osVersion &&
    (devicePosture.osVersion.includes('Windows 7') ||
      devicePosture.osVersion.includes('Windows 8'))
  ) {
    score += 20;
    factors.push('Outdated operating system');
    requiresMFA = true;
  }

  // ============================================
  // ACCESS CONTEXT CHECKS
  // ============================================

  // 1. Impossible travel
  if (accessContext.impossibleTravel) {
    score += 50;
    factors.push('Impossible travel detected (geographically inconsistent)');
    blockAccess = true;
  }

  // 2. VPN detected
  if (accessContext.isVPN) {
    score += 15;
    factors.push('VPN or proxy detected');
    if (userProfile.riskTolerance === 'LOW') {
      requiresMFA = true;
    }
  }

  // 3. Tor detected
  if (accessContext.isTor) {
    score += 30;
    factors.push('Tor or anonymization network detected');
    if (userProfile.riskTolerance === 'LOW' || userProfile.riskTolerance === 'MEDIUM') {
      blockAccess = true;
    }
  }

  // 4. Low reputation IP
  if (accessContext.ipReputation && accessContext.ipReputation < 50) {
    score += 20;
    factors.push(`Low reputation IP (score: ${accessContext.ipReputation})`);
    if (accessContext.ipReputation < 30) {
      requiresMFA = true;
    }
  }

  // 5. New country
  if (
    accessContext.country &&
    !userProfile.knownCountries.includes(accessContext.country)
  ) {
    score += 20;
    factors.push(`New country detected (${accessContext.country})`);
    if (userProfile.riskTolerance === 'LOW') {
      requiresMFA = true;
    }
  }

  // 6. Fingerprint not recognized
  if (
    devicePosture.fingerprint &&
    !userProfile.knownFingerprints.includes(devicePosture.fingerprint)
  ) {
    score += 10;
    factors.push('Device fingerprint not recognized');
  }

  // ============================================
  // DETERMINE RISK LEVEL
  // ============================================

  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  if (score >= 50) {
    level = 'CRITICAL';
    blockAccess = true;
  } else if (score >= 35) {
    level = 'HIGH';
    requiresMFA = true;
  } else if (score >= 20) {
    level = 'MEDIUM';
    if (userProfile.riskTolerance === 'LOW') {
      requiresMFA = true;
    }
  } else {
    level = 'LOW';
  }

  return {
    level,
    score: Math.min(score, 100),
    factors,
    requiresMFA,
    blockAccess,
  };
}

// ============================================
// EXPRESS MIDDLEWARE EXAMPLE
// ============================================

/*
import express from 'express';

app.use((req, res, next) => {
  // Extract device context from headers
  const devicePostureHeader = req.headers['x-device-posture'] as string | undefined;
  const accessContextHeader = req.headers['x-access-context'] as string | undefined;

  const { devicePosture, accessContext } = parseDeviceContext(
    devicePostureHeader,
    accessContextHeader
  );

  // Store in request for later use
  req.deviceContext = {
    devicePosture,
    accessContext,
  };

  next();
});

// Protect sensitive endpoints
app.post('/api/transactions', authenticateToken, (req, res) => {
  const user = req.user; // From JWT
  const { devicePosture, accessContext } = req.deviceContext;

  // Get user profile from database
  const userProfile = {
    id: user.id,
    knownFingerprints: [...user.trustedDevices],
    knownCountries: ['NG', 'US', 'UK'],
    riskTolerance: 'MEDIUM' as const,
  };

  // Assess risk
  const risk = assessRisk(devicePosture, accessContext, userProfile);

  console.log(`Risk Assessment for ${user.email}:`, {
    level: risk.level,
    score: risk.score,
    factors: risk.factors,
  });

  // Block if necessary
  if (risk.blockAccess) {
    return res.status(403).json({
      error: 'Access denied',
      reason: risk.factors.join(', '),
      riskLevel: risk.level,
    });
  }

  // Require MFA if needed
  if (risk.requiresMFA && !req.mfaVerified) {
    return res.status(401).json({
      error: 'Additional verification required',
      mfaRequired: true,
      reason: risk.factors.join(', '),
      riskLevel: risk.level,
    });
  }

  // Risk acceptance logging
  if (risk.level !== 'LOW') {
    // Log for audit trail
    console.log(`Risk accepted for ${user.email}: ${risk.level}`);
    // Optionally alert user
  }

  // Proceed with request
  res.json({ success: true });
});
*/

// ============================================
// SAMPLE RISK ASSESSMENT RESPONSES
// ============================================

/*
// LOW RISK - Proceed normally
{
  level: 'LOW',
  score: 5,
  factors: ['Unknown device (first login)'],
  requiresMFA: false,
  blockAccess: false
}

// MEDIUM RISK - Require MFA
{
  level: 'MEDIUM',
  score: 22,
  factors: [
    'Unknown device (first login)',
    'New country detected (NG)'
  ],
  requiresMFA: true,
  blockAccess: false
}

// HIGH RISK - Require MFA and log
{
  level: 'HIGH',
  score: 40,
  factors: [
    'Device is jailbroken/rooted',
    'VPN or proxy detected',
    'New country detected (UA)',
    'Low reputation IP (score: 45)'
  ],
  requiresMFA: true,
  blockAccess: false
}

// CRITICAL RISK - Block access
{
  level: 'CRITICAL',
  score: 75,
  factors: [
    'Impossible travel detected (geographically inconsistent)',
    'Tor or anonymization network detected',
    'Low reputation IP (score: 20)',
    'Device is jailbroken/rooted'
  ],
  requiresMFA: true,
  blockAccess: true
}
*/

export default {
  parseDeviceContext,
  assessRisk,
};
