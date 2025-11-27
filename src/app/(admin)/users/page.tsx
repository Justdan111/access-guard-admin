"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { useState } from "react"

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    role: "User",
    status: "Active",
    riskScore: 35,
    lastLogin: "2 min ago",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "Admin",
    status: "Active",
    riskScore: 18,
    lastLogin: "Just now",
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice.johnson@company.com",
    role: "User",
    status: "Active",
    riskScore: 62,
    lastLogin: "1 hour ago",
  },
  {
    id: 4,
    name: "Bob Wilson",
    email: "bob.wilson@company.com",
    role: "User",
    status: "Inactive",
    riskScore: 45,
    lastLogin: "3 days ago",
  },
  {
    id: 5,
    name: "Carol Davis",
    email: "carol.davis@company.com",
    role: "User",
    status: "Active",
    riskScore: 28,
    lastLogin: "30 min ago",
  },
  {
    id: 6,
    name: "David Martinez",
    email: "david.martinez@company.com",
    role: "User",
    status: "Active",
    riskScore: 71,
    lastLogin: "5 hours ago",
  },
]

function getRiskBadgeColor(score: number) {
  if (score < 30) return "bg-green-100 text-green-800"
  if (score < 60) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

export default function UserManagementPage() {
  const [search, setSearch] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                <p className="text-muted-foreground mt-2">Manage user accounts and permissions</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>View and manage all system users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold">Name</th>
                          <th className="text-left py-3 px-4 font-semibold">Email</th>
                          <th className="text-left py-3 px-4 font-semibold">Role</th>
                          <th className="text-left py-3 px-4 font-semibold">Status</th>
                          <th className="text-left py-3 px-4 font-semibold">Risk Score</th>
                          <th className="text-left py-3 px-4 font-semibold">Last Login</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-border hover:bg-muted/50 cursor-pointer transition"
                          >
                            <td className="py-3 px-4 font-medium">{user.name}</td>
                            <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{user.role}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }
                              >
                                {user.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getRiskBadgeColor(user.riskScore)}>{user.riskScore}%</Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{user.lastLogin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
    </ProtectedRoute>
  )
}
