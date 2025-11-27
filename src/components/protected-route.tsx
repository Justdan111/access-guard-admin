"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode
  requiredRole?: "user" | "admin"
}) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  if (requiredRole && user?.role !== requiredRole) {
    router.push(user?.role === "admin" ? "/admin" : "/dashboard")
    return null
  }

  return <>{children}</>
}
