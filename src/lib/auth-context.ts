"use client";

import {
  collectDevicePosture,
  collectAccessContext,
  storeDevicePosture,
  storeAccessContext,
  clearContexts,
  DevicePosture,
  AccessContext,
} from "./deviceContext";

// ============================================
// DEVICE CONTEXT INITIALIZATION
// ============================================

/**
 * Initialize device and access context on login
 * Call this after successful authentication
 */
export async function initializeDeviceContext(): Promise<{
  devicePosture: Partial<DevicePosture>;
  accessContext: Partial<AccessContext>;
}> {
  console.log("🔍 Collecting device context...");

  try {
    // Collect device posture
    const devicePosture = await collectDevicePosture();
    console.log("✅ Device Posture Collected:", devicePosture);
    storeDevicePosture(devicePosture);

    // Collect access context
    const accessContext = await collectAccessContext();
    console.log("✅ Access Context Collected:", accessContext);
    storeAccessContext(accessContext);

    console.log("✅ Device context initialized successfully");

    return {
      devicePosture,
      accessContext,
    };
  } catch (error) {
    console.error("❌ Failed to initialize device context:", error);
    throw error;
  }
}

/**
 * Refresh device context (call periodically or on demand)
 */
export async function refreshDeviceContext(): Promise<{
  devicePosture: Partial<DevicePosture>;
  accessContext: Partial<AccessContext>;
}> {
  console.log("🔄 Refreshing device context...");

  try {
    const devicePosture = await collectDevicePosture();
    storeDevicePosture(devicePosture);

    const accessContext = await collectAccessContext();
    storeAccessContext(accessContext);

    console.log("✅ Device context refreshed");

    return {
      devicePosture,
      accessContext,
    };
  } catch (error) {
    console.error("❌ Failed to refresh device context:", error);
    throw error;
  }
}

/**
 * Clear device context on logout
 */
export function clearDeviceContext(): void {
  console.log("🗑️  Clearing device context...");
  clearContexts();
  console.log("✅ Device context cleared");
}
