"use client"

import { useAuth } from "@/hooks/use-auth"
import { Users, Building2, Clock, AlertCircle, FileText } from "lucide-react"
import { useState } from "react"

export function HRPortalContent() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState("overview")

  const hrServices = [
    {
      id: "benefits",
      title: "Benefits & Insurance",
      description: "View health, dental, and retirement plans",
      icon: Building2,
      color: "bg-blue-100",
    },
    {
      id: "pto",
      title: "Time Off Management",
      description: "Request and track vacation and sick days",
      icon: Clock,
      color: "bg-green-100",
    },
    {
      id: "policies",
      title: "Company Policies",
      description: "Access employee handbook and policies",
      icon: FileText,
      color: "bg-purple-100",
    },
    {
      id: "org",
      title: "Organization Chart",
      description: "View company structure and team members",
      icon: Users,
      color: "bg-orange-100",
    },
  ]

  const ptoStatus = {
    available: 12,
    used: 8,
    pending: 2,
  }

  const recentUpdates = [
    { title: "2025 Health Insurance Open Enrollment", date: "2025-01-15", status: "important" },
    { title: "Benefits Guide Updated", date: "2025-01-10", status: "info" },
    { title: "New Remote Work Policy", date: "2025-01-05", status: "info" },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hrServices.map((service) => {
          const Icon = service.icon
          return (
            <button
              key={service.id}
              className="text-left p-6 bg-card border border-border rounded-lg hover:shadow-lg transition"
            >
              <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="text-gray-700" size={24} />
              </div>
              <h3 className="font-semibold mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </button>
          )
        })}
      </div>

      {/* Time Off Summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-bold text-lg mb-6">2025 Time Off Summary</h3>

        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-muted-foreground text-sm mb-2">Available Days</p>
            <p className="text-3xl font-bold text-primary">{ptoStatus.available}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-2">Days Used</p>
            <p className="text-3xl font-bold text-orange-600">{ptoStatus.used}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-2">Pending Requests</p>
            <p className="text-3xl font-bold text-yellow-600">{ptoStatus.pending}</p>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${(ptoStatus.used / (ptoStatus.available + ptoStatus.used)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-lg">Recent HR Updates</h3>
        </div>

        <div className="divide-y divide-border">
          {recentUpdates.map((update, i) => (
            <div key={i} className="px-6 py-4 hover:bg-background transition flex items-start gap-4">
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  update.status === "important" ? "bg-red-500" : "bg-blue-500"
                }`}
              ></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{update.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(update.date).toLocaleDateString()}</p>
              </div>
              {update.status === "important" && <AlertCircle className="text-red-500 flex-shrink-0" size={18} />}
            </div>
          ))}
        </div>
      </div>

      {/* Contact HR */}
      <div className="bg-primary/5 border-2 border-primary rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Users className="text-primary flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              Contact HR directly for questions about benefits, time off, or company policies.
            </p>
            <div className="flex gap-4">
              <a href="mailto:hr@company.com" className="text-primary font-semibold hover:underline">
                hr@company.com
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="tel:+1234567890" className="text-primary font-semibold hover:underline">
                +1 (234) 567-890
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
