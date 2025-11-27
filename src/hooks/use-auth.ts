"use client"

import { useEffect, useState } from "react"
import { verifyMockJWT } from "@/lib/auth-utils"
import type { User } from "@/lib/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("auth_token")
        const userJson = localStorage.getItem("user")

        if (token && userJson) {
          const parsedUser = JSON.parse(userJson)
          const verified = verifyMockJWT(token)

          if (verified) {
            setUser(parsedUser)
            setIsAuthenticated(true)
          } else {
            // Token expired or invalid
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user")
            setIsAuthenticated(false)
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    setUser(null)
    setIsAuthenticated(false)
  }

  return { user, isLoading, isAuthenticated, logout }
}
