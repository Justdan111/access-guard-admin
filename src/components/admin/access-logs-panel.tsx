/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import type { AccessLog } from "@/lib/types";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export function AccessLogsPanel() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // call proxy which forwards Authorization header to upstream admin logs endpoint
        const response = await fetch("/api/admin/logs");
        if (!response.ok) throw new Error("Failed to fetch access logs");
        const json = await response.json();
        const source = json?.logs ?? [];

        // map upstream shape -> AccessLog[]
        const mapped: AccessLog[] = source.map((l: any, i: number) => ({
          id: `${l.timestamp}-${i}`,
          userId: l.user ?? "unknown",
          action: (l.decision ?? "unknown").toString(),
          resource: l.resource ?? l.resourcePath ?? "unknown",
          riskScore: Math.round(
            (typeof l.riskScore === "number" ? l.riskScore : 0) * 100
          ),
          status:
            l.decision === "allow" || l.decision === "allowed"
              ? "success"
              : "denied",
          timestamp: l.timestamp ?? new Date().toISOString(),
        }));

        setLogs(mapped);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <Clock className="text-primary" size={20} />
        <h3 className="font-bold text-lg">Access Logs</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                User
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                Action
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                Risk Score
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-muted-foreground"
                >
                  Loading logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-muted-foreground"
                >
                  No logs available
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-background transition">
                  <td className="px-6 py-4 text-sm">{log.userId}</td>
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-sm">{log.resource}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold ${
                        log.riskScore < 25
                          ? "text-green-600"
                          : log.riskScore < 50
                          ? "text-yellow-600"
                          : log.riskScore < 75
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                    >
                      {log.riskScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {log.status === "success" ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={16} />
                        <span className="text-xs font-semibold">Success</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle size={16} />
                        <span className="text-xs font-semibold">Denied</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
