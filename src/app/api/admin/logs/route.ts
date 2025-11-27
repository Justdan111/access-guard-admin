export async function GET(request: Request) {
  try {
    // read auth_token cookie
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|; )auth_token=([^;]+)/);
    let token = match ? match[1] : null;

    // fallback demo/admin token if no cookie present
    if (!token) {
      token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTI4OTg0NDVkYjMyNjNmYzJmNDFiMDkiLCJ1c2VybmFtZSI6ImphbmUuc21pdGgiLCJlbWFpbCI6ImphbmUuc21pdGhAY29tcGFueS5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE3NjQyNjgxODQsImV4cCI6MTc2NDM1NDU4NCwiaXNzIjoiYWNjZXNzZ3VhcmQifQ.Lst6TMI9gUzVXf3eFOaqIKvKfXKSK_HCwqBG4atDvQw";
    }

    const upstream = await fetch(
      "https://acessguard.onrender.com/api/admin/logs",
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

    const resHeaders = new Headers({ "Content-Type": "application/json" });
    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) {
      const sanitized = setCookie.replace(/;\s*Domain=[^;]+/gi, "");
      resHeaders.set("Set-Cookie", sanitized);
    }

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Logs proxy failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
