"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save } from "lucide-react"
import { useState } from "react"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    mfaRequired: true,
    passwordExpiry: 90,
    sessionTimeout: 30,
    twoFactorEnabled: true,
    encryptionLevel: "AES-256",
    auditLogging: true,
    notificationsEnabled: true,
  })

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleChange = (key: string, value: number | string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
                <p className="text-muted-foreground mt-2">Configure security policies and system settings</p>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Policies</CardTitle>
                    <CardDescription>Configure authentication and access control policies</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">Multi-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground mt-1">Require MFA for all users</p>
                      </div>
                      <button
                        onClick={() => handleToggle("mfaRequired")}
                        className={`relative w-12 h-6 rounded-full transition ${settings.mfaRequired ? "bg-green-600" : "bg-gray-300"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${settings.mfaRequired ? "right-1" : "left-1"}`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-6">
                      <div>
                        <p className="font-semibold text-foreground">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground mt-1">Enable 2FA for admin accounts</p>
                      </div>
                      <button
                        onClick={() => handleToggle("twoFactorEnabled")}
                        className={`relative w-12 h-6 rounded-full transition ${settings.twoFactorEnabled ? "bg-green-600" : "bg-gray-300"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${settings.twoFactorEnabled ? "right-1" : "left-1"}`}
                        />
                      </button>
                    </div>

                    <div className="border-t border-border pt-6">
                      <label className="block">
                        <p className="font-semibold text-foreground mb-2">Password Expiration Days</p>
                        <input
                          type="number"
                          value={settings.passwordExpiry}
                          onChange={(e) => handleChange("passwordExpiry", Number.parseInt(e.target.value))}
                          className="w-full max-w-xs px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                    </div>

                    <div className="border-t border-border pt-6">
                      <label className="block">
                        <p className="font-semibold text-foreground mb-2">Session Timeout (minutes)</p>
                        <input
                          type="number"
                          value={settings.sessionTimeout}
                          onChange={(e) => handleChange("sessionTimeout", Number.parseInt(e.target.value))}
                          className="w-full max-w-xs px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Encryption Settings</CardTitle>
                    <CardDescription>Manage data encryption and privacy</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block">
                        <p className="font-semibold text-foreground mb-2">Encryption Level</p>
                        <select
                          value={settings.encryptionLevel}
                          onChange={(e) => handleChange("encryptionLevel", e.target.value)}
                          className="w-full max-w-xs px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="AES-128">AES-128</option>
                          <option value="AES-192">AES-192</option>
                          <option value="AES-256">AES-256</option>
                        </select>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Logging and Monitoring</CardTitle>
                    <CardDescription>Configure audit logging and alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">Audit Logging</p>
                        <p className="text-sm text-muted-foreground mt-1">Log all system and user activities</p>
                      </div>
                      <button
                        onClick={() => handleToggle("auditLogging")}
                        className={`relative w-12 h-6 rounded-full transition ${settings.auditLogging ? "bg-green-600" : "bg-gray-300"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${settings.auditLogging ? "right-1" : "left-1"}`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-6">
                      <div>
                        <p className="font-semibold text-foreground">Security Notifications</p>
                        <p className="text-sm text-muted-foreground mt-1">Receive alerts for security events</p>
                      </div>
                      <button
                        onClick={() => handleToggle("notificationsEnabled")}
                        className={`relative w-12 h-6 rounded-full transition ${settings.notificationsEnabled ? "bg-green-600" : "bg-gray-300"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${settings.notificationsEnabled ? "right-1" : "left-1"}`}
                        />
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <button className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium">
                  <Save className="h-4 w-4" />
                  Save Settings
                </button>
              </div>
            </div>
          </main>
        </div>
    </ProtectedRoute>
  )
}
