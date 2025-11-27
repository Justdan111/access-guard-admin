import type { DevicePosture, RiskAssessment, RiskFactor, User } from "./types"

/**
 * Zero-Trust Engine: Calculates real-time risk scores based on device posture and user context
 */

export function calculateDeviceRiskScore(devicePosture: DevicePosture): number {
  let riskScore = 0

  // Firewall penalty (20 points max)
  if (!devicePosture.firewallEnabled) riskScore += 20

  // Antivirus penalty (20 points max)
  if (!devicePosture.antivirusEnabled) riskScore += 20

  // Disk encryption penalty (15 points max)
  if (!devicePosture.diskEncryptionEnabled) riskScore += 15

  // OS version recency (10 points max)
  const daysSinceUpdate = getDaysSinceDate(devicePosture.lastUpdate)
  if (daysSinceUpdate > 90) riskScore += 10
  else if (daysSinceUpdate > 30) riskScore += 5

  // Compliance score impact (35 points max)
  if (devicePosture.complianceScore < 50) riskScore += 35
  else if (devicePosture.complianceScore < 75) riskScore += 20
  else if (devicePosture.complianceScore < 90) riskScore += 10

  return Math.min(riskScore, 100)
}

export function assessUserRisk(user: User, devicePosture: DevicePosture, transactionAmount?: number): RiskAssessment {
  const deviceRisk = calculateDeviceRiskScore(devicePosture)
  const factors: RiskFactor[] = []

  // Device posture factors
  if (!devicePosture.firewallEnabled) {
    factors.push({
      name: "Firewall Disabled",
      severity: "high",
      description: "Device firewall is not enabled",
      weight: 20,
    })
  }

  if (!devicePosture.antivirusEnabled) {
    factors.push({
      name: "Antivirus Disabled",
      severity: "high",
      description: "Device antivirus protection is not enabled",
      weight: 20,
    })
  }

  if (devicePosture.complianceScore < 75) {
    factors.push({
      name: "Low Compliance Score",
      severity: "medium",
      description: `Device compliance score is ${devicePosture.complianceScore}%`,
      weight: 15,
    })
  }

  // Transaction amount factor
  if (transactionAmount && transactionAmount > 50000) {
    factors.push({
      name: "High Transaction Amount",
      severity: "medium",
      description: `Transaction amount ($${transactionAmount}) exceeds threshold`,
      weight: 25,
    })
  }

  // Calculate weighted risk score
  let totalRiskScore = deviceRisk
  if (transactionAmount && transactionAmount > 50000) {
    totalRiskScore = Math.min(totalRiskScore + 25, 100)
  }

  const riskLevel: "low" | "medium" | "high" | "critical" =
    totalRiskScore < 25 ? "low" : totalRiskScore < 50 ? "medium" : totalRiskScore < 75 ? "high" : "critical"

  return {
    userId: user.id,
    deviceId: devicePosture.deviceId,
    riskScore: totalRiskScore,
    riskLevel,
    factors,
    timestamp: new Date().toISOString(),
  }
}

function getDaysSinceDate(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case "low":
      return "#10b981" // green
    case "medium":
      return "#f59e0b" // amber
    case "high":
      return "#ef4444" // red
    case "critical":
      return "#7c2d12" // dark red
    default:
      return "#6b7280" // gray
  }
}
