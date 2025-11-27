"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard/header"
import { AccountOverview } from "@/components/dashboard/account-overview"
import { TransactionsList } from "@/components/dashboard/transactions-list"
import { RiskAssessment } from "@/components/dashboard/risk-assessment"

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-background">
          <main className="flex-1 overflow-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Banking Dashboard</h1>
                <p className="text-muted-foreground mt-2">Manage your accounts and transactions securely</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 space-y-6">
                  <AccountOverview />
                  <TransactionsList />
                </div>
                <div>
                  <RiskAssessment />
                </div>
              </div>
          </main>
        </div>
    </ProtectedRoute>
  )
}
