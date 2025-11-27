/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// ============================================
// DEVICE POSTURE COLLECTION
// ============================================

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

export async function collectDevicePosture(): Promise<Partial<DevicePosture>> {
  // Check for manual overrides (for demo purposes)
  const overrides = JSON.parse(
    typeof window !== "undefined"
      ? localStorage.getItem("devicePostureOverride") || "{}"
      : "{}"
  );
  if (overrides.enabled) {
    return overrides.data;
  }

  // Detect Operating System
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  let os = "Unknown";
  let osVersion = "Unknown";

  if (userAgent.includes("Windows NT 10.0")) {
    os = "Windows";
    osVersion = "Windows 10/11";
  } else if (userAgent.includes("Windows NT 6.3")) {
    os = "Windows";
    osVersion = "Windows 8.1";
  } else if (userAgent.includes("Windows NT 6.2")) {
    os = "Windows";
    osVersion = "Windows 8";
  } else if (userAgent.includes("Windows NT 6.1")) {
    os = "Windows";
    osVersion = "Windows 7";
  } else if (userAgent.includes("Mac OS X")) {
    os = "MacOS";
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
    osVersion = match ? `MacOS ${match[1].replace("_", ".")}` : "MacOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
    osVersion = "Linux";
  } else if (userAgent.includes("Android")) {
    os = "Android";
    const match = userAgent.match(/Android (\d+(\.\d+)?)/);
    osVersion = match ? `Android ${match[1]}` : "Android";
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS";
    const match = userAgent.match(/OS (\d+[._]\d+)/);
    osVersion = match ? `iOS ${match[1].replace("_", ".")}` : "iOS";
  }

  // Detect Browser
  const browser = detectBrowser();

  // Generate Device Fingerprint
  const fingerprint = await generateDeviceFingerprint();

  // Check if device is known
  const knownDevices = JSON.parse(
    typeof window !== "undefined"
      ? localStorage.getItem("knownDevices") || "[]"
      : "[]"
  );
  const isKnownDevice = knownDevices.includes(fingerprint);

  // If new device, add to known devices
  if (!isKnownDevice) {
    knownDevices.push(fingerprint);
    if (typeof window !== "undefined") {
      localStorage.setItem("knownDevices", JSON.stringify(knownDevices));
    }
  }

  // Screen Resolution
  const screenResolution =
    typeof window !== "undefined"
      ? `${window.screen.width}x${window.screen.height}`
      : "Unknown";

  // These cannot be reliably detected in browser, so we make educated guesses
  const diskEncrypted = guessDiskEncryption(os);
  const antivirus = guessAntivirusStatus(os);
  const isJailbroken = detectJailbreak();

  return {
    diskEncrypted,
    antivirus,
    osVersion,
    os,
    isJailbroken,
    fingerprint,
    isKnownDevice,
    browser,
    screenResolution,
    lastSecurityUpdate: new Date().toISOString(),
  };
}

// ============================================
// ACCESS CONTEXT COLLECTION
// ============================================

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

export async function collectAccessContext(): Promise<Partial<AccessContext>> {
  // Check for manual overrides (for demo purposes)
  const overrides = JSON.parse(
    typeof window !== "undefined"
      ? localStorage.getItem("accessContextOverride") || "{}"
      : "{}"
  );
  if (overrides.enabled) {
    return overrides.data;
  }

  // Get timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Get IP and location information
  const ipInfo = await getRealIPInfo();

  // Detect VPN
  const isVPN = await detectVPN(ipInfo);

  // Get geolocation from browser (requires user permission)
  let coords = {
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  };
  try {
    const position = await getBrowserGeolocation();
    coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    console.log("Geolocation permission denied or unavailable");
  }

  // Check impossible travel
  const impossibleTravel = await checkImpossibleTravel(
    coords.latitude || ipInfo?.latitude,
    coords.longitude || ipInfo?.longitude
  );

  return {
    impossibleTravel,
    country: ipInfo?.country_code || "UNKNOWN",
    city: ipInfo?.city || "Unknown",
    latitude: coords.latitude,
    longitude: coords.longitude,
    timezone,
    isVPN,
    isTor: ipInfo?.tor || false,
    ipAddress: ipInfo?.ip || "Unknown",
    ipReputation: ipInfo?.threat?.is_threat ? 30 : 85,
    accessTime: new Date().toISOString(),
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate unique device fingerprint
 */
async function generateDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "server-side";

  // Check if already generated
  const stored = localStorage.getItem("deviceFingerprint");
  if (stored) return stored;

  // Canvas fingerprinting
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f00";
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = "#00f";
    ctx.fillText("Browser Fingerprint 🔐", 2, 2);
  }
  const canvasData = canvas.toDataURL();

  // Combine multiple signals
  const components = [
    canvasData,
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
    (navigator as any).deviceMemory || "unknown",
    navigator.platform,
    navigator.maxTouchPoints || 0,
  ].join("|");

  // Simple hash (for production, use a proper hash library)
  const fingerprint = btoa(components).substring(0, 32);

  localStorage.setItem("deviceFingerprint", fingerprint);
  return fingerprint;
}

/**
 * Detect browser
 */
function detectBrowser(): string {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("Opera/") || ua.includes("OPR/")) return "Opera";
  return "Unknown";
}

/**
 * Guess disk encryption based on OS
 */
function guessDiskEncryption(os: string): boolean {
  // Modern MacOS and iOS have encryption enabled by default
  if (os === "MacOS" || os === "iOS") return true;

  // For others, we can't detect, so assume false (or make it configurable)
  return false;
}

/**
 * Guess antivirus status
 */
function guessAntivirusStatus(os: string): boolean {
  // Windows Defender is built-in on Windows 10+
  if (os === "Windows") return true;

  // MacOS has built-in security
  if (os === "MacOS") return true;

  // Mobile OS have built-in security
  if (os === "iOS" || os === "Android") return true;

  return false;
}

/**
 * Detect jailbroken/rooted device (basic heuristics)
 */
function detectJailbreak(): boolean {
  if (typeof window === "undefined") return false;

  // Check for common jailbreak indicators
  const ua = navigator.userAgent;

  // iOS jailbreak detection
  if (ua.includes("iPhone") || ua.includes("iPad")) {
    // Check for Cydia (common jailbreak store)
    if ((window as any).cydia) return true;

    // Check for unusual file access (iOS normally restricts this)
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("HEAD", "cydia://package/com.example.package", false);
      xhr.send();
      return true; // If this doesn't throw, might be jailbroken
    } catch {
      // Normal behavior
    }
  }

  return false;
}

/**
 * Get real IP and location info from API
 */
async function getRealIPInfo(): Promise<any> {
  try {
    // Using ipapi.co (free tier: 1000 requests/day)
    const response = await fetch("https://ipapi.co/json/");
    return await response.json();
  } catch (error) {
    console.error("Failed to get IP info:", error);

    // Fallback to another service
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return { ip: data.ip };
    } catch {
      return null;
    }
  }
}

/**
 * Detect VPN using multiple methods
 */
async function detectVPN(ipInfo: any): Promise<boolean> {
  // Method 1: Check if IP info API reports VPN
  if (ipInfo?.vpn === true) return true;
  if (ipInfo?.proxy === true) return true;

  // Method 2: WebRTC leak detection
  try {
    const isVPN = await webRTCVPNDetection();
    if (isVPN) return true;
  } catch (error) {
    console.log("WebRTC VPN detection failed:", error);
  }

  // Method 3: Check time zone mismatch
  const reportedTimezone = ipInfo?.timezone;
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (reportedTimezone && reportedTimezone !== browserTimezone) {
    // Significant timezone mismatch might indicate VPN
    return true;
  }

  return false;
}

/**
 * WebRTC VPN detection
 */
async function webRTCVPNDetection(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      const ips = new Set<string>();

      pc.createDataChannel("");
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => resolve(false));

      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) {
          // Analysis complete
          const ipArray = Array.from(ips);
          const hasPrivateIP = ipArray.some((ip) => isPrivateIP(ip));
          const hasPublicIP = ipArray.some((ip) => !isPrivateIP(ip));

          // If both private and public IPs detected, likely VPN
          resolve(hasPrivateIP && hasPublicIP);
          return;
        }

        const ipMatch = /([0-9]{1,3}\.){3}[0-9]{1,3}/.exec(
          ice.candidate.candidate
        );
        if (ipMatch) ips.add(ipMatch[0]);
      };

      // Timeout after 2 seconds
      setTimeout(() => {
        pc.close();
        resolve(false);
      }, 2000);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Check if IP is private/local
 */
function isPrivateIP(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 169 && parts[1] === 254)
  );
}

/**
 * Get browser geolocation
 */
function getBrowserGeolocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  });
}

/**
 * Check for impossible travel
 */
async function checkImpossibleTravel(
  currentLat?: number,
  currentLon?: number
): Promise<boolean> {
  if (!currentLat || !currentLon) return false;
  if (typeof window === "undefined") return false;

  const lastLocation = JSON.parse(
    localStorage.getItem("lastLocation") || "null"
  );

  if (!lastLocation) {
    // First time, save location
    localStorage.setItem(
      "lastLocation",
      JSON.stringify({
        latitude: currentLat,
        longitude: currentLon,
        timestamp: Date.now(),
      })
    );
    return false;
  }

  // Calculate distance
  const distance = calculateDistance(
    lastLocation.latitude,
    lastLocation.longitude,
    currentLat,
    currentLon
  );

  // Calculate time difference in hours
  const timeDiff = Date.now() - lastLocation.timestamp;
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  // Update last location
  localStorage.setItem(
    "lastLocation",
    JSON.stringify({
      latitude: currentLat,
      longitude: currentLon,
      timestamp: Date.now(),
    })
  );

  // If traveled more than 500km in less than 2 hours, flag as impossible
  if (distance > 500 && hoursDiff < 2) {
    console.warn(
      `🚨 Impossible travel detected: ${distance.toFixed(
        0
      )}km in ${hoursDiff.toFixed(1)}h`
    );
    return true;
  }

  return false;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ============================================
// CONTEXT STORAGE AND RETRIEVAL
// ============================================

const DEVICE_POSTURE_KEY = "devicePosture";
const ACCESS_CONTEXT_KEY = "accessContext";

export function storeDevicePosture(posture: Partial<DevicePosture>) {
  if (typeof window !== "undefined") {
    localStorage.setItem(DEVICE_POSTURE_KEY, JSON.stringify(posture));
  }
}

export function getStoredDevicePosture(): Partial<DevicePosture> | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(DEVICE_POSTURE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function storeAccessContext(context: Partial<AccessContext>) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_CONTEXT_KEY, JSON.stringify(context));
  }
}

export function getStoredAccessContext(): Partial<AccessContext> | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(ACCESS_CONTEXT_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearContexts() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEVICE_POSTURE_KEY);
    localStorage.removeItem(ACCESS_CONTEXT_KEY);
  }
}

// ============================================
// DEMO OVERRIDES (for testing)
// ============================================

export function setDevicePostureOverride(
  enabled: boolean,
  data?: Partial<DevicePosture>
) {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "devicePostureOverride",
      JSON.stringify({ enabled, data })
    );
  }
}

export function setAccessContextOverride(
  enabled: boolean,
  data?: Partial<AccessContext>
) {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "accessContextOverride",
      JSON.stringify({ enabled, data })
    );
  }
}

export function clearOverrides() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("devicePostureOverride");
    localStorage.removeItem("accessContextOverride");
  }
}
