import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Proxying signup request to backend...");

    const upstreamUrl = "https://acessguard.onrender.com/auth/signup";

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = upstream.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await upstream.json();
    } else {
      const text = await upstream.text();
      console.error("Backend returned non-JSON:", text);
      return new Response(JSON.stringify({ error: `Backend returned ${upstream.status}: ${text}` }), {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ FIX: Set the auth_token cookie if signup was successful
    const resHeaders = new Headers({ "Content-Type": "application/json" });
    
    if (upstream.ok && data.token) {
      // Set cookie with security flags
      resHeaders.set(
        "Set-Cookie",
        `auth_token=${data.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${
          process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`
      );
      console.log("✅ Auth token cookie set successfully");
    }

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: resHeaders,
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("❌ Signup Proxy Error:", errorMessage);
    console.error("Full error:", err);
    return new Response(JSON.stringify({ error: "Internal Proxy Error", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}