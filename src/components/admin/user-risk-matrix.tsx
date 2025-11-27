"use client"

import { mockUsers, mockDevicePostures } from "@/lib/mock-data"
import { assessUserRisk } from "@/lib/zero-trust-engine"
import { TrendingUp } from "lucide-react"

export function UserRiskMatrix() {
  const userRisks = mockUsers
    .map((user) => {
      const posture = mockDevicePostures.find((d) => d.deviceId === user.deviceId)
      if (!posture) return null
      return {
        user,
        assessment: assessUserRisk(user, posture),
      }
    })
    .filter((item): item is { user: typeof mockUsers[0]; assessment: ReturnType<typeof assessUserRisk> } => item !== null)

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <TrendingUp className="text-primary" size={20} />
        <h3 className="font-bold text-lg">User Risk Assessment</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Department</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Device</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Risk Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {userRisks.map(({ user, assessment }) => (
              <tr key={user.id} className="hover:bg-background transition">
                <td className="px-6 py-4">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-6 py-4 text-sm">{user.department}</td>
                <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{user.deviceId}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          assessment.riskLevel === "low"
                            ? "bg-green-500"
                            : assessment.riskLevel === "medium"
                              ? "bg-yellow-500"
                              : assessment.riskLevel === "high"
                                ? "bg-orange-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${assessment.riskScore}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold w-8">{assessment.riskScore}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      assessment.riskLevel === "low"
                        ? "bg-green-100 text-green-700"
                        : assessment.riskLevel === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : assessment.riskLevel === "high"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {assessment.riskLevel.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
