"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import type { RiskAssessment as RiskType } from "@/lib/types"
import { AlertCircle, Shield } from "lucide-react"

export function RiskAssessment() {
  const { user } = useAuth()
  const [assessment, setAssessment] = useState<RiskType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchAssessment = async () => {
      try {
        const response = await fetch("/api/risk-assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        })
        const data = await response.json()
        setAssessment(data)
      } catch (error) {
        console.error("Failed to fetch risk assessment:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessment()
  }, [user])

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" }
      case "medium":
        return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" }
      case "high":
        return { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" }
      case "critical":
        return { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" }
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground text-sm">Loading risk assessment...</p>
      </div>
    )
  }

  if (!assessment) {
    return null
  }

  const colors = getRiskColor(assessment.riskLevel)

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6`}>
      <div className="flex items-center gap-2 mb-4">
        {assessment.riskLevel === "low" ? (
          <Shield className={colors.text} size={24} />
        ) : (
          <AlertCircle className={colors.text} size={24} />
        )}
        <h3 className={`font-bold text-lg ${colors.text}`}>Risk Assessment</h3>
      </div>

      <div className="mb-6">
        <p className={`text-sm ${colors.text} opacity-75 mb-2`}>Current Risk Score</p>
        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-bold ${colors.text}`}>{assessment.riskScore}</p>
          <p className={`text-sm ${colors.text} opacity-75`}>/100</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full ${
            assessment.riskLevel === "low"
              ? "bg-green-500"
              : assessment.riskLevel === "medium"
                ? "bg-yellow-500"
                : assessment.riskLevel === "high"
                  ? "bg-orange-500"
                  : "bg-red-500"
          }`}
          style={{ width: `${assessment.riskScore}%` }}
        ></div>
      </div>

      <p className={`text-xs font-semibold ${colors.text} mb-4 uppercase`}>{assessment.riskLevel} RISK</p>

      {assessment.factors.length > 0 && (
        <div className="space-y-2">
          <p className={`text-xs font-semibold ${colors.text} uppercase`}>Risk Factors</p>
          {assessment.factors.map((factor, i) => (
            <div key={i} className="text-xs">
              <p className="font-medium">{factor.name}</p>
              <p className={`${colors.text} opacity-75`}>{factor.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
