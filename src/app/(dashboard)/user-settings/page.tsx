"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { SettingsContent } from "@/components/dashboard/settings"

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-background">
          <main className="flex-1 overflow-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account and security preferences</p>
              </div>
              <SettingsContent />
          </main>
        </div>
    </ProtectedRoute>
  )
}
