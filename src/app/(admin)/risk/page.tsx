"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, AlertCircle, Activity } from "lucide-react"

const riskTrendData = [
  { time: "00:00", risk: 35 },
  { time: "04:00", risk: 42 },
  { time: "08:00", risk: 38 },
  { time: "12:00", risk: 52 },
  { time: "16:00", risk: 48 },
  { time: "20:00", risk: 45 },
]

const deviceRiskData = [
  { device: "Desktop-001", risk: 28 },
  { device: "Laptop-042", risk: 65 },
  { device: "Mobile-156", risk: 42 },
  { device: "Tablet-089", risk: 35 },
  { device: "Desktop-105", risk: 58 },
]

export default function RiskManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">
          <main className="flex-1 overflow-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Risk Management</h1>
                <p className="text-muted-foreground mt-2">
                  Monitor and manage security risks across all devices and users
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Current Risk Level</CardTitle>
                      <TrendingUp className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">45%</div>
                      <p className="text-xs text-muted-foreground">↑ 3% from last hour</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">High Risk Devices</CardTitle>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">Requiring attention</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Risk Incidents</CardTitle>
                      <Activity className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24h</div>
                      <p className="text-xs text-muted-foreground">8 incidents this week</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Score Trend</CardTitle>
                    <CardDescription>24-hour risk level progression</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={riskTrendData}>
                        <defs>
                          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="risk" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRisk)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Device Risk Distribution</CardTitle>
                    <CardDescription>Risk scores by device</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={deviceRiskData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="device" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="risk" fill="#003b6f" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
          </main>
        </div>
    </ProtectedRoute>
  )
}
