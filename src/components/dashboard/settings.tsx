"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { mockDevicePostures } from "@/lib/mock-data"
import { Eye, EyeOff, Shield, Bell, Lock, LogOut } from "lucide-react"
import { useState } from "react"

export function SettingsContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [selectedTab, setSelectedTab] = useState("account")
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    emailAlerts: true,
    smsAlerts: false,
    twoFactorEnabled: true,
  })

  const devicePosture = user ? mockDevicePostures.find((d) => d.deviceId === user.deviceId) : null

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const settingsTabs = [
    { id: "account", label: "Account" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
  ]

  return (
    <div className="max-w-3xl">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-6">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              selectedTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account Settings */}
      {selectedTab === "account" && (
        <div className="space-y-6">
          {/* Profile Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-bold text-lg mb-6">Profile Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  value={user?.name}
                  disabled
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Department</label>
                <input
                  type="text"
                  value={user?.department}
                  disabled
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">User ID</label>
                <input
                  type="text"
                  value={user?.id}
                  disabled
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {selectedTab === "security" && (
        <div className="space-y-6">
          {/* Device Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              Device Security
            </h3>

            {devicePosture && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Device ID</p>
                    <p className="font-mono text-sm font-semibold">{devicePosture.deviceId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Operating System</p>
                    <p className="font-semibold">
                      {devicePosture.osType} {devicePosture.osVersion}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Firewall Status</span>
                    {devicePosture.firewallEnabled ? (
                      <span className="inline-flex items-center gap-2 text-green-600">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-red-600">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                        Disabled
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Antivirus Status</span>
                    {devicePosture.antivirusEnabled ? (
                      <span className="inline-flex items-center gap-2 text-green-600">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-red-600">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                        Disabled
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Disk Encryption</span>
                    {devicePosture.diskEncryptionEnabled ? (
                      <span className="inline-flex items-center gap-2 text-green-600">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-red-600">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                        Disabled
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-muted-foreground text-sm mb-2">Compliance Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          devicePosture.complianceScore >= 90
                            ? "bg-green-500"
                            : devicePosture.complianceScore >= 75
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                        }`}
                        style={{ width: `${devicePosture.complianceScore}%` }}
                      ></div>
                    </div>
                    <span className="font-bold min-w-fit">{devicePosture.complianceScore}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Lock size={20} className="text-primary" />
              Change Password
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button className="w-full px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition">
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {selectedTab === "notifications" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Bell size={20} className="text-primary" />
              Notification Preferences
            </h3>

            <div className="space-y-4">
              {[
                { key: "notificationsEnabled", label: "All Notifications" },
                { key: "emailAlerts", label: "Email Alerts" },
                { key: "smsAlerts", label: "SMS Alerts" },
                { key: "twoFactorEnabled", label: "Two-Factor Authentication" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleToggle(key as keyof typeof settings)}
                  className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-background transition"
                >
                  <span className="font-medium">{label}</span>
                  <div
                    className={`w-12 h-6 rounded-full transition ${
                      settings[key as keyof typeof settings] ? "bg-primary" : "bg-muted"
                    } flex items-center ${settings[key as keyof typeof settings] ? "justify-end" : "justify-start"} px-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Section */}
      <div className="mt-8 bg-card border border-destructive/30 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Sign Out</h3>
        <p className="text-muted-foreground mb-6">Sign out of all active sessions across all devices.</p>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-destructive text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition flex items-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )
}
