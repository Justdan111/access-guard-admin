"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import type { Transaction } from "@/lib/types"
import { ArrowUpRight, ArrowDownLeft, Clock, Download, Filter } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

export default function TransactionsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all")
  const [sortBy, setSortBy] = useState<"date" | "amount">("date")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!user) return

    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/transactions?userId=${user.id}`)
        const data = await response.json()
        setTransactions(data)
      } catch (error) {
        console.error("Failed to fetch transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user])

  const filteredTransactions = transactions
    .filter((tx) => {
      if (filterType !== "all" && tx.type !== filterType) return false
      if (searchQuery && !tx.recipient.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }
      return b.amount - a.amount
    })

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 25) return { badge: "bg-green-100 text-green-700", bar: "bg-green-500" }
    if (riskScore < 50) return { badge: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-500" }
    if (riskScore < 75) return { badge: "bg-orange-100 text-orange-700", bar: "bg-orange-500" }
    return { badge: "bg-red-100 text-red-700", bar: "bg-red-500" }
  }

  const totalIn = transactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)
  const totalOut = transactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)

  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground mt-2">View and manage all your transactions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm mb-1">Total Transactions</p>
          <p className="text-2xl font-bold">{transactions.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm mb-1">Total Incoming</p>
          <p className="text-2xl font-bold text-green-600">
            ${totalIn.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm mb-1">Total Outgoing</p>
          <p className="text-2xl font-bold text-red-600">
            ${totalOut.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm mb-1">Net Flow</p>
          <p className={`text-2xl font-bold ${totalIn - totalOut >= 0 ? "text-green-600" : "text-red-600"}`}>
            ${(totalIn - totalOut).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as "all" | "credit" | "debit")}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Incoming Only</option>
                <option value="debit">Outgoing Only</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Recipient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                  Risk Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const riskColors = getRiskColor(tx.riskScore)
                  return (
                    <tr key={tx.id} className="hover:bg-background/50 transition">
                      <td className="px-6 py-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === "credit" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {tx.type === "credit" ? (
                            <ArrowDownLeft className="text-green-600" size={20} />
                          ) : (
                            <ArrowUpRight className="text-red-600" size={20} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">{tx.recipient}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock size={14} />
                          {new Date(tx.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-bold ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                          {tx.type === "credit" ? "+" : "-"}$
                          {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-gray-200">
                            <div
                              className={`h-2 rounded-full ${riskColors.bar}`}
                              style={{ width: `${tx.riskScore}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${riskColors.badge}`}>
                            {tx.riskScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            tx.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : tx.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
