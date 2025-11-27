"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { ArrowUpRight, Clock, Download, Filter } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import api from "@/lib/api";

interface BankingTransaction {
  id: number;
  from: string;
  to: string;
  amount: number;
  status: "completed" | "pending";
  type: string;
  time: string;
}

interface BankingTransactionsResponse {
  app: string;
  user: string;
  transactions: BankingTransaction[];
  totalTransactions: number;
  totalIncome: number;
  totalOutgoings: number;
  netFlow: number;
}

// Hardcoded risk scores for transactions
const HARDCODED_RISK_SCORES: Record<number, number> = {
  1: 15,
  2: 45,
  3: 8,
};

// Hardcoded statuses for transactions
const HARDCODED_STATUSES: Record<number, "completed" | "pending" | "failed"> = {
  1: "completed",
  2: "pending",
  3: "completed",
};

// Risk bar component to avoid inline styles
function RiskBar({ score }: { score: number }) {
  const getRiskColor = (riskScore: number) => {
    if (riskScore < 25)
      return { badge: "bg-green-100 text-green-700", bar: "bg-green-500" };
    if (riskScore < 50)
      return { badge: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-500" };
    if (riskScore < 75)
      return { badge: "bg-orange-100 text-orange-700", bar: "bg-orange-500" };
    return { badge: "bg-red-100 text-red-700", bar: "bg-red-500" };
  };

  const colors = getRiskColor(score);
  const scoreClamped = Math.min(Math.max(score, 0), 100);

  // Map score to Tailwind width classes
  const getWidthClass = () => {
    if (scoreClamped <= 10) return "w-1";
    if (scoreClamped <= 20) return "w-2";
    if (scoreClamped <= 30) return "w-3";
    if (scoreClamped <= 40) return "w-4";
    if (scoreClamped <= 50) return "w-8";
    if (scoreClamped <= 60) return "w-10";
    if (scoreClamped <= 70) return "w-12";
    if (scoreClamped <= 80) return "w-14";
    return "w-16";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden flex">
        <div
          className={`${
            colors.bar
          } transition-all shrink-0 h-2 rounded-full ${getWidthClass()}`}
          role="img"
          aria-label={`Risk score: ${score}%`}
        />
      </div>
      <span
        className={`text-xs font-semibold px-2 py-1 rounded ${colors.badge}`}
      >
        {score}%
      </span>
    </div>
  );
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const [apiData, setApiData] = useState<BankingTransactionsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "transfer">("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const result = await api.get<BankingTransactionsResponse>(
          `/api/banking/transactions`
        );

        if (!result.ok) {
          throw new Error(result.error || "Failed to fetch transactions");
        }

        setApiData(result.data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setApiData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const displayTransactions = apiData?.transactions || [];

  const filteredTransactions = displayTransactions
    .filter((tx) => {
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (
        searchQuery &&
        !tx.to.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      }
      return b.amount - a.amount;
    });

  const getStatusColor = (status: string) => {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const totalTransactions = apiData?.totalTransactions || 0;
  const totalIncome = apiData?.totalIncome || 0;
  const totalOutgoings = apiData?.totalOutgoings || 0;
  const netFlow = apiData?.netFlow || 0;

  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-background">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all your transactions
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-1">
              Total Transactions
            </p>
            <p className="text-2xl font-bold">{totalTransactions}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-600">
              $
              {totalIncome.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-1">
              Total Outgoings
            </p>
            <p className="text-2xl font-bold text-red-600">
              $
              {totalOutgoings.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-1">Net Flow</p>
            <p
              className={`text-2xl font-bold ${
                netFlow >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${netFlow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by recipient account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-muted-foreground" />
                <select
                  title="Filter transactions"
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as "all" | "transfer")
                  }
                  className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Transactions</option>
                  <option value="transfer">Transfers Only</option>
                </select>
              </div>

              <select
                title="Sort transactions"
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    From
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Risk Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const riskScore = HARDCODED_RISK_SCORES[tx.id] || 50;
                    const hardcodedStatus =
                      HARDCODED_STATUSES[tx.id] || tx.status;

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-background/50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="text-blue-600" size={16} />
                            <p className="font-semibold text-foreground">
                              {tx.from}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-foreground">
                            {tx.to}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={14} />
                            {new Date(tx.time).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-foreground">
                            $
                            {tx.amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <RiskBar score={riskScore} />
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                              hardcodedStatus
                            )}`}
                          >
                            {hardcodedStatus.charAt(0).toUpperCase() +
                              hardcodedStatus.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
