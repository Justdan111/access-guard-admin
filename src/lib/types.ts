// User types
export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  department?: string
  deviceId: string
  createdAt: string
}

// Device Posture types
export interface DevicePosture {
  deviceId: string
  osType: "windows" | "macos" | "linux" | "ios" | "android"
  osVersion: string
  firewallEnabled: boolean
  antivirusEnabled: boolean
  diskEncryptionEnabled: boolean
  lastUpdate: string
  complianceScore: number // 0-100
  riskLevel: "low" | "medium" | "high" | "critical"
}

// Risk Assessment types
export interface RiskAssessment {
  userId: string
  deviceId: string
  riskScore: number // 0-100
  riskLevel: "low" | "medium" | "high" | "critical"
  factors: RiskFactor[]
  timestamp: string
}

export interface RiskFactor {
  name: string
  severity: "low" | "medium" | "high"
  description: string
  weight: number
}

// Transaction types
export interface Transaction {
  id: string
  userId: string
  amount: number
  currency: string
  type: "debit" | "credit" | "transfer"
  recipient: string
  status: "pending" | "completed" | "failed"
  riskScore: number
  timestamp: string
}

// Access Log types
export interface AccessLog {
  id: string
  userId: string
  action: string
  resource: string
  status: "success" | "denied"
  riskScore: number
  deviceId: string
  timestamp: string
}

// Auth types
export interface AuthToken {
  token: string
  expiresAt: string
  user: User
}
