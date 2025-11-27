/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

// Mock database for demo/testing
const DEMO_USERS: Record<string, { password: string; role: "admin" | "user"; name: string; email: string }> = {
  "john.doe@company.com": {
    password: "password",
    role: "user",
    name: "John Doe",
    email: "john.doe@company.com",
  },
  "jane.smith@company.com": {
    password: "password",
    role: "admin",
    name: "Jane Smith",
    email: "jane.smith@company.com",
  },
};

// Simple JWT token generator (for demo only - use proper JWT in production)
function generateMockToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
  }));
  const signature = btoa("mock-signature");
  return `${header}.${payload}.${signature}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username and password are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Try upstream auth service first
    let data: any = null;
    let upstreamSuccess = false;

    try {
      console.log("Attempting to reach upstream auth service (may take 30-60s for Render free tier)...");
      const upstream = await fetch("https://acessguard.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        signal: AbortSignal.timeout(60000), // 60 second timeout for Render free tier cold start
      });

      const contentType = upstream.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await upstream.json();
      } else {
        const text = await upstream.text();
        data = { message: text };
      }

      upstreamSuccess = upstream.ok;
      console.log("Upstream response:", { status: upstream.status, ok: upstream.ok });
    } catch (upstreamErr: any) {
      console.error("Upstream auth failed:", {
        message: upstreamErr?.message,
        code: upstreamErr?.code,
      });
      console.log("Falling back to demo mode for testing...");
    }

    // Fallback to demo mode if upstream fails
    if (!upstreamSuccess) {
      const user = DEMO_USERS[username as string];

      if (!user || user.password !== password) {
        return new Response(
          JSON.stringify({ error: "Invalid username or password" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Generate mock token
      const token = generateMockToken(username);

      data = {
        token,
        user: {
          id: username,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.role === "admin" ? "Security" : "Banking",
          deviceId: `device-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        },
      };

      console.log("✅ Demo mode login successful:", { username, role: user.role });
    }

    const resHeaders = new Headers({ "Content-Type": "application/json" });

    // If we have a token in response, set it
    if (data && (data as any).token) {
      const token = (data as any).token;
      const maxAge = 60 * 60 * 24 * 7; // 7 days

      // Only use "Secure" if in production
      const isProduction = process.env.NODE_ENV === "production";
      const cookie = `auth_token=${token}; Path=/; HttpOnly; ${
        isProduction ? "Secure;" : ""
      } SameSite=Lax; Max-Age=${maxAge}`;

      resHeaders.set("Set-Cookie", cookie);
    }

    return new Response(JSON.stringify(data), {
      status: data ? 200 : 502,
      headers: resHeaders,
    });
  } catch (err) {
    console.error("Login route error:", err);
    return new Response(
      JSON.stringify({
        error: "Authentication failed",
        details: process.env.NODE_ENV === "development" ? String(err) : undefined,
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
