/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

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

    console.log("🔐 Forwarding login request to backend...");

    // Forward login to upstream auth service
    const upstream = await fetch("https://acessguard.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const contentType = upstream.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await upstream.json();
    } else {
      const text = await upstream.text();
      console.error("Backend returned non-JSON:", text);
      data = { message: text };
    }

    console.log("📦 Backend response status:", upstream.status);
    console.log("📦 Backend response data:", data);

    const resHeaders = new Headers({ "Content-Type": "application/json" });
    
    // ✅ FIX: Set cookie if backend returned a token
    if (data && (data as any).token) {
      const token = (data as any).token;
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      
      // Only use "Secure" in production (not on localhost)
      const isProduction = process.env.NODE_ENV === "production";
      
      // ⚠️ FIXED: Changed ${false} to ${isProduction}
      const cookie = `auth_token=${token}; Path=/; HttpOnly; ${isProduction ? "Secure;" : ""} SameSite=Lax; Max-Age=${maxAge}`;
      
      resHeaders.set("Set-Cookie", cookie);
      console.log("✅ Auth cookie set:", cookie);
    } else {
      // Fallback: If upstream sent Set-Cookie, use it
      const setCookie = upstream.headers.get("set-cookie");
      if (setCookie) {
        const sanitized = setCookie.replace(/;\s*Domain=[^;]+/gi, "");
        resHeaders.set("Set-Cookie", sanitized);
        console.log("✅ Upstream cookie forwarded");
      } else {
        console.warn("⚠️ No token found in response");
      }
    }

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch (err) {
    console.error("❌ Login Proxy Error:", err);
    return new Response(
      JSON.stringify({ 
        error: "Authentication proxy failed",
        details: err instanceof Error ? err.message : String(err)
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}