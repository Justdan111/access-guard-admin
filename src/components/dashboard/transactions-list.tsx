"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import type { Transaction } from "@/lib/types"
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"

export function TransactionsList() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 25) return "text-green-600"
    if (riskScore < 50) return "text-yellow-600"
    if (riskScore < 75) return "text-orange-600"
    return "text-red-600"
  }

  const getRiskBgColor = (riskScore: number) => {
    if (riskScore < 25) return "bg-green-50"
    if (riskScore < 50) return "bg-yellow-50"
    if (riskScore < 75) return "bg-orange-50"
    return "bg-red-50"
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-bold text-lg">Recent Transactions</h3>
      </div>

      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No transactions yet</div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="px-6 py-4 hover:bg-background transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "credit" ? "bg-green-100" : tx.type === "debit" ? "bg-red-100" : "bg-blue-100"
                    }`}
                  >
                    {tx.type === "credit" ? (
                      <ArrowDownLeft className={tx.type === "credit" ? "text-green-600" : "text-red-600"} size={20} />
                    ) : (
                      <ArrowUpRight className={tx.type === "debit" ? "text-red-600" : "text-blue-600"} size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{tx.recipient}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "credit" ? "+" : "-"}${tx.amount.toLocaleString()}
                  </p>
                  <p
                    className={`text-xs font-semibold ${getRiskColor(tx.riskScore)} ${getRiskBgColor(tx.riskScore)} px-2 py-1 rounded`}
                  >
                    Risk: {tx.riskScore}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    tx.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : tx.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
