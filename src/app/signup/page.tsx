"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"

export default function SignupPage() {
    const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // generate a simple username from full name (falls back to email local-part)
  const generateUsername = (fullName: string, emailFallback?: string) => {
    if (!fullName || !fullName.trim()) {
      return (emailFallback || "user").split("@")[0].toLowerCase()
    }

    // normalize, remove diacritics, split words
    const parts = fullName
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .split(/\s+/)

    let uname = parts.length > 1 ? `${parts[0]}.${parts[parts.length - 1]}` : parts[0]

    // allow only a-z0-9._- and collapse multiple separators, limit length
    uname = uname.replace(/[^a-z0-9._-]/g, ".").replace(/\.{2,}/g, ".").slice(0, 30)

    // ensure it doesn't start or end with a dot or hyphen/underscore
    uname = uname.replace(/^[._-]+|[._-]+$/g, "")

    if (!uname) return (emailFallback || "user").split("@")[0].toLowerCase()

    return uname
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Basic client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const username = generateUsername(name, email)

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, username }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Registration failed")
      }

      const authData = await response.json()
      
      // Store token and user data just like login
      localStorage.setItem("auth_token", authData.token)
      localStorage.setItem("user", JSON.stringify(authData.user))

      // Redirect to dashboard (assuming new users aren't admins)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
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
          <h2 className="text-4xl font-bold mb-6">Join the Secure Ecosystem</h2>
          <p className="text-lg opacity-90 mb-8 leading-relaxed">
            Create an account to access enterprise-grade financial tools protected by 
            next-generation zero-trust architecture.
          </p>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-1">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">Identity Verification</p>
                <p className="text-sm opacity-75">Automated KYC and identity proofing</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-1">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">End-to-End Encryption</p>
                <p className="text-sm opacity-75">Data remains encrypted at rest and in transit</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-1">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">24/7 Threat Monitoring</p>
                <p className="text-sm opacity-75">AI-driven anomaly detection</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm opacity-75">© 2025 SecureBank. All rights reserved.</p>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h3 className="text-3xl font-bold mb-2">Create Account</h3>
            <p className="text-muted-foreground">Begin your secure banking journey</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
             {/* Name Field */}
             <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="John Doe"
                required
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="you@company.com"
                required
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
                  placeholder="Create a password"
                  required
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Footer / Toggle to Login */}
          <div className="mt-8 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}