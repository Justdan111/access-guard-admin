/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { DashboardHeader } from "@/components/dashboard/header";
import { AccountOverview } from "@/components/dashboard/account-overview";
import { TransactionsList } from "@/components/dashboard/transactions-list";
import { useEffect, useState } from "react"; // added: hooks

export default function DashboardPage() {
  const [role, setRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        const parsed = JSON.parse(userJson);
        const derived =
          Array.isArray(parsed?.roles) && parsed.roles.length
            ? parsed.roles[0]
            : parsed?.role;
        if (derived) setRole(derived);
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  return (
    <ProtectedRoute requiredRole={role}>
      <div className="min-h-screen bg-background">
        <main className="flex-1 overflow-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Banking Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your accounts and transactions securely
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <AccountOverview />
              <TransactionsList />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
