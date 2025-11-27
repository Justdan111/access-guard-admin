export async function GET(request: Request) {
  try {
    // Read auth_token from incoming cookies
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|; )auth_token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing auth token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract device context from headers
    const devicePostureHeader = request.headers.get("x-device-posture");
    const accessContextHeader = request.headers.get("x-access-context");

    let parsedDevicePosture: unknown = null;
    let parsedAccessContext: unknown = null;

    if (devicePostureHeader) {
      try {
        parsedDevicePosture = JSON.parse(devicePostureHeader);
      } catch (e) {
        console.warn("Failed to parse device posture header:", e);
      }
    }

    if (accessContextHeader) {
      try {
        parsedAccessContext = JSON.parse(accessContextHeader);
      } catch (e) {
        console.warn("Failed to parse access context header:", e);
      }
    }

    console.log("📱 Device Context Received:", {
      devicePosture: parsedDevicePosture,
      accessContext: parsedAccessContext,
    });

    // Forward to upstream with Authorization header
    const upstream = await fetch(
      "https://acessguard.onrender.com/api/banking/dashboard",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const contentType = upstream.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await upstream.json();
    } else {
      const text = await upstream.text();
      data = { message: text };
    }

    // Add device context to response
    const responseData = {
      ...data,
      deviceContext: {
        devicePosture: parsedDevicePosture,
        accessContext: parsedAccessContext,
      },
    };

    // Proxy any Set-Cookie (sanitize Domain) and return JSON body
    const resHeaders = new Headers({ "Content-Type": "application/json" });
    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) {
      const sanitized = setCookie.replace(/;\s*Domain=[^;]+/gi, "");
      resHeaders.set("Set-Cookie", sanitized);
    }

    return new Response(JSON.stringify(responseData), {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Dashboard proxy failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
