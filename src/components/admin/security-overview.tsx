"use client"

import { mockAccessLogs, mockUsers, mockDevicePostures } from "@/lib/mock-data"
import { Shield, AlertTriangle, Users, Lock } from "lucide-react"

export function SecurityOverview() {
  const highRiskUsers = mockUsers.filter((u) => {
    const posture = mockDevicePostures.find((p) => p.deviceId === u.deviceId)
    return posture && posture.complianceScore < 75
  }).length

  const recentLogs = mockAccessLogs.slice(0, 5)
  const deniedAccess = recentLogs.filter((l) => l.status === "denied").length

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Shield className="text-primary" size={24} />
          <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">ACTIVE</span>
        </div>
        <p className="text-muted-foreground text-sm mb-1">Active Users</p>
        <p className="text-3xl font-bold">{mockUsers.length}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <AlertTriangle className="text-yellow-600" size={24} />
          <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">MONITOR</span>
        </div>
        <p className="text-muted-foreground text-sm mb-1">At-Risk Devices</p>
        <p className="text-3xl font-bold">{highRiskUsers}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Lock className="text-orange-600" size={24} />
          <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded">ALERT</span>
        </div>
        <p className="text-muted-foreground text-sm mb-1">Access Denied</p>
        <p className="text-3xl font-bold">{deniedAccess}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Users className="text-green-600" size={24} />
          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">SECURE</span>
        </div>
        <p className="text-muted-foreground text-sm mb-1">Compliant Devices</p>
        <p className="text-3xl font-bold">{mockDevicePostures.filter((d) => d.complianceScore >= 90).length}</p>
      </div>
    </div>
  )
}
