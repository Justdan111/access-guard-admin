"use client"

import { Shield } from "lucide-react"
import { useState } from "react"

export function PolicyControls() {
  const [policies, setPolicies] = useState({
    minComplianceScore: 75,
    enableMFA: true,
    maxSessionDuration: 8,
    deviceEncryptionRequired: true,
    geoRestriction: true,
  })

  const handleToggle = (key: keyof typeof policies) => {
    setPolicies((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
    }))
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="text-primary" size={20} />
        <h3 className="font-bold text-lg">Security Policies</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Minimum Compliance Score</span>
            <span className="text-primary font-bold">{policies.minComplianceScore}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={policies.minComplianceScore}
            onChange={(e) => setPolicies((prev) => ({ ...prev, minComplianceScore: Number.parseInt(e.target.value) }))}
            className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Max Session Duration</span>
            <span className="text-primary font-bold">{policies.maxSessionDuration}h</span>
          </label>
          <input
            type="range"
            min="1"
            max="24"
            value={policies.maxSessionDuration}
            onChange={(e) => setPolicies((prev) => ({ ...prev, maxSessionDuration: Number.parseInt(e.target.value) }))}
            className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          {[
            { key: "enableMFA", label: "Require Multi-Factor Authentication" },
            { key: "deviceEncryptionRequired", label: "Require Device Encryption" },
            { key: "geoRestriction", label: "Enable Geo-Restrictions" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleToggle(key as keyof typeof policies)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-background transition"
            >
              <span className="text-sm font-medium">{label}</span>
              <div
                className={`w-12 h-6 rounded-full transition ${
                  policies[key as keyof typeof policies] ? "bg-primary" : "bg-muted"
                } flex items-center ${policies[key as keyof typeof policies] ? "justify-end" : "justify-start"} px-1`}
              >
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </button>
          ))}
        </div>

        <button className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity">
          Save Policies
        </button>
      </div>
    </div>
  )
}
