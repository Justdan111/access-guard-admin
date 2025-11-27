"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { SecurityOverview } from "@/components/admin/security-overview"
import { AccessLogsPanel } from "@/components/admin/access-logs-panel"
import { UserRiskMatrix } from "@/components/admin/user-risk-matrix"
import { PolicyControls } from "@/components/admin/policy-control"

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Security Dashboard</h1>
                <p className="text-muted-foreground mt-2">Real-time monitoring and zero-trust security management</p>
              </div>

              <div className="space-y-6">
                <SecurityOverview />

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <UserRiskMatrix />
                  </div>
                  <div>
                    <PolicyControls />
                  </div>
                </div>

                <AccessLogsPanel />
              </div>
            </div>
          </main>
        </div>
    </ProtectedRoute>
  )
}
