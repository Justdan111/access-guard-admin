"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { HRPortalContent } from "@/components/dashboard/hr-portal"

export default function HRPortalPage() {
  return (
    <ProtectedRoute requiredRole="banker">
      <div className="min-h-screen bg-background">
          <main className="flex-1 overflow-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">HR Portal</h1>
                <p className="text-muted-foreground mt-2">Access HR services and company information</p>
              </div>
              <HRPortalContent />
          </main>
        </div>
    </ProtectedRoute>
  )
}
