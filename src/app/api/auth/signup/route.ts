import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Log the attempt for debugging
    console.log("Proxying signup request to backend...");

    // 2. FIXED URL: The backend mounts authRouter at "/auth", NOT "/api/auth"
    // Trying to access /api/auth triggers the zeroTrustGuard on /api, causing 401
    const upstreamUrl = "https://acessguard.onrender.com/auth/signup";

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Do NOT pass Authorization headers here for signup/login
      },
      body: JSON.stringify(body),
    });

    // 3. Handle non-JSON responses from backend (e.g., 404 HTML pages or 500 errors)
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

    // 4. Return the response exactly as received
    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Signup Proxy Error:", err);
    return new Response(JSON.stringify({ error: "Internal Proxy Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}