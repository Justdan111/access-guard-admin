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

    // forward login to upstream auth service
    // Fixed URL: pointing to /auth/login based on your backend structure
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
      data = { message: text };
    }

    const resHeaders = new Headers({ "Content-Type": "application/json" });
    const setCookie = upstream.headers.get("set-cookie");
    
    // If upstream returned a token in JSON, set a cookie for our domain.
    if (data && (data as any).token) {
      const token = (data as any).token;
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      
      // FIX: Only use "Secure" if we are in production. 
      // This prevents the cookie from being rejected on http://localhost
      const isProduction = process.env.NODE_ENV === "production";
      const cookie = `auth_token=${token}; Path=/; HttpOnly; ${false ? "Secure;" : ""} SameSite=Lax; Max-Age=${maxAge}`;
      
      resHeaders.set("Set-Cookie", cookie);
    } else if (setCookie) {
      // Fallback: If upstream sent Set-Cookie, sanitize it
      const sanitized = setCookie.replace(/;\s*Domain=[^;]+/gi, "");
      resHeaders.set("Set-Cookie", sanitized);
    }

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch (err) {
    console.error("Login Proxy Error:", err);
    return new Response(
      JSON.stringify({ error: "Authentication proxy failed" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}