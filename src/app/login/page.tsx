"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Login failed")
      }

      const authData = await response.json()
      localStorage.setItem("auth_token", authData.token)
      localStorage.setItem("user", JSON.stringify(authData.user))

      // Redirect based on role
      if (authData.user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-primary-foreground rounded-lg flex items-center justify-center">
              <span className="font-bold text-primary text-xl">ZT</span>
            </div>
            <h1 className="text-3xl font-bold">SecureBank</h1>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold mb-6">Enterprise Banking Security</h2>
          <p className="text-lg opacity-90 mb-8 leading-relaxed">
            Experience banking with advanced zero-trust architecture. Every access is verified, every device is
            validated.
          </p>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold">Real-Time Risk Assessment</p>
                <p className="text-sm opacity-75">Continuous device posture monitoring</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold">Zero-Trust Architecture</p>
                <p className="text-sm opacity-75">Never trust, always verify</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold">Adaptive Authentication</p>
                <p className="text-sm opacity-75">Context-aware security controls</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm opacity-75">© 2025 SecureBank. All rights reserved.</p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h3 className="text-3xl font-bold mb-2">Welcome Back</h3>
            <p className="text-muted-foreground">Sign in to your banking account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="you@company.com"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Demo Credentials */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
              <p className="font-medium text-primary mb-2">Demo Credentials:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>
                  <strong>User:</strong> john.doe@company.com
                </li>
                <li>
                  <strong>Admin:</strong> jane.smith@company.com
                </li>
                <li>
                  <strong>Password:</strong> password
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            This is a secure banking platform with zero-trust security enabled.
          </p>
        </div>
      </div>
    </div>
  )
}
