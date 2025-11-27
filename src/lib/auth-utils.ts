import type { AuthToken, User } from "./types"
import { mockUsers } from "./mock-data"

// Mock JWT secret (in production, use environment variable)
const JWT_SECRET = "zero-trust-banking-secret-key-change-in-production"

/**
 * Mock authentication functions
 */

export function mockLogin(email: string, password: string): AuthToken | null {
  // In production, this would verify against a real database
  const user = mockUsers.find((u) => u.email === email)

  if (!user) return null

  // Mock password check (all passwords are 'password' for demo)
  if (password !== "password") return null

  const token = generateMockJWT(user)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  return {
    token,
    expiresAt,
    user,
  }
}

export function generateMockJWT(user: User): string {
  // Client-side JWT generation (mock)
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  }

  // Simple JWT-like token for demonstration
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = btoa(JSON.stringify(payload))
  const signature = btoa(JWT_SECRET)

  return `${header}.${body}.${signature}`
}

export function verifyMockJWT(token: string): User | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    const user = mockUsers.find((u) => u.id === payload.userId)

    return user || null
  } catch {
    return null
  }
}

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function setStoredAuthToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("auth_token", token)
}

export function clearStoredAuthToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  const userJson = localStorage.getItem("user")
  return userJson ? JSON.parse(userJson) : null
}

export function setStoredUser(user: User): void {
  if (typeof window === "undefined") return
  localStorage.setItem("user", JSON.stringify(user))
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("user")
}
