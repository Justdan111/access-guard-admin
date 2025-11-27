"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, Bell, User } from "lucide-react"
import { useState } from "react"
import { useEffect } from "react"
import { BlockedModal } from "@/components/dashboard/risk-dialog"

type Assessment = {
  userId: string
  deviceId: string
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  factors: Array<{ name: string; description: string }>
}

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [showRiskModal, setShowRiskModal] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const formatPageTitle = () => {
    const segments = pathname.split("/").filter((segment) => segment !== "")

    if (segments.length === 0) return "Dashboard"

    const mainRoute = segments[0]
   
    return mainRoute
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Fetch risk assessment and show modal for medium/high
  useEffect(() => {
    if (!user) return

    let isMounted = true

    const fetchAssessment = async () => {
      try {
        const resp = await fetch('/api/risk-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })

        if (!resp.ok) return
        const data: Assessment = await resp.json()
        if (!isMounted) return

        setAssessment(data)
        if (data.riskLevel === 'medium' || data.riskLevel === 'high') {
          setShowRiskModal(true)
        }
      } catch (err) {
        console.error('Failed to fetch assessment', err)
      }
    }

    fetchAssessment()

    return () => {
      isMounted = false
    }
  }, [user])

  const handleModalClose = () => {
    // If the device is high risk, sign the user out and redirect to login
    if (assessment?.riskLevel === 'high') {
      logout()
      router.push('/login')
      return
    }

    setShowRiskModal(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Page Title */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">
            {formatPageTitle()}
          </h1>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button 
            onClick={() => router.push("/notifications")}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 bg-[#818cf8] rounded-full flex items-center justify-center hover:bg-[#6366f1] transition-colors"
              >
                <User className="w-5 h-5 text-white" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50 py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => router.push("/profile")}
                    className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-sm"
                  >
                    <User size={16} />
                    View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-destructive/10 transition-colors flex items-center gap-2 text-destructive text-sm"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Risk dialog (shown for medium/high risk) */}
      <BlockedModal
        isOpen={showRiskModal}
        riskScore={assessment?.riskScore ?? 0}
        factors={
          assessment?.factors
            ? assessment.factors.map((f) => `${f.name}: ${f.description}`)
            : []
        }
        onClose={handleModalClose}
      />
    </header>
  )
}