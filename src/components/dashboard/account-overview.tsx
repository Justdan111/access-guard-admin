"use client"

import { useAuth } from "@/hooks/use-auth"
import { mockDevicePostures } from "@/lib/mock-data"
import { CreditCard, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function AccountOverview() {
  const { user } = useAuth()
  const [showBalance, setShowBalance] = useState(true)

  const devicePosture = user ? mockDevicePostures.find((d) => d.deviceId === user.deviceId) : null

  const balance = 245789.5

  return (
    <div className="space-y-6">
      {/* Main Account Card */}
      <div className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-8 shadow-lg">
        <div className="flex justify-between items-start mb-12">
          <div>
            <p className="text-primary-foreground/70 text-sm mb-2">Total Balance</p>
            <div className="flex items-center gap-2">
              <h2 className="text-4xl font-bold">
                {showBalance ? `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••••"}
              </h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-primary-foreground/10 rounded-lg transition"
              >
                {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>
          <CreditCard size={40} className="opacity-50" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-primary-foreground/20">
          <div>
            <p className="text-xs opacity-70 mb-1">Account Number</p>
            <p className="font-mono text-sm font-semibold">****5678</p>
          </div>
          <div>
            <p className="text-xs opacity-70 mb-1">Account Type</p>
            <p className="font-semibold text-sm">Business Checking</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm mb-1">Available for Transfer</p>
          <p className="text-2xl font-bold">${(balance * 0.8).toLocaleString("en-US", { minimumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm mb-1">Monthly Transactions</p>
          <p className="text-2xl font-bold">24</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm mb-1">Device Compliance</p>
          <p className="text-2xl font-bold">{devicePosture?.complianceScore || 0}%</p>
        </div>
      </div>
    </div>
  )
}
