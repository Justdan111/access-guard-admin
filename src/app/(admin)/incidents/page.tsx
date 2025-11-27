"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

const incidents = [
  {
    id: 1,
    title: "Failed Login Attempt",
    description: "Multiple failed login attempts from Alice Johnson",
    severity: "high",
    status: "resolved",
    user: "Alice Johnson",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    title: "Device Compliance Issue",
    description: "Laptop-042 failed antivirus check",
    severity: "critical",
    status: "open",
    user: "Bob Wilson",
    timestamp: "30 min ago",
  },
  {
    id: 3,
    title: "Unusual Access Pattern",
    description: "Access from new location detected for John Doe",
    severity: "medium",
    status: "investigating",
    user: "John Doe",
    timestamp: "15 min ago",
  },
  {
    id: 4,
    title: "Policy Violation",
    description: "User attempted access outside business hours",
    severity: "low",
    status: "resolved",
    user: "Carol Davis",
    timestamp: "4 hours ago",
  },
  {
    id: 5,
    title: "Network Anomaly",
    description: "Unusual data transfer volume detected",
    severity: "high",
    status: "investigating",
    user: "David Martinez",
    timestamp: "1 hour ago",
  },
]

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800"
    case "high":
      return "bg-orange-100 text-orange-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "low":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "resolved":
      return <CheckCircle className="h-4 w-4" />
    case "investigating":
      return <Clock className="h-4 w-4" />
    case "open":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return null
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "resolved":
      return "bg-green-100 text-green-800"
    case "investigating":
      return "bg-blue-100 text-blue-800"
    case "open":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function IncidentsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">
          <main className="flex-1 overflow-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Security Incidents</h1>
                <p className="text-muted-foreground mt-2">Track and manage security incidents</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1</div>
                    <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Investigating</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2</div>
                    <p className="text-xs text-muted-foreground">In progress</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2</div>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Incident Timeline</CardTitle>
                  <CardDescription>Recent security incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">{getStatusIcon(incident.status)}</div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{incident.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                            <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                          <span>{incident.user}</span>
                          <span>{incident.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
          </main>
        </div>
    </ProtectedRoute>
  )
}
