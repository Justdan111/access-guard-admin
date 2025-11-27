import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const backendUrl =
      "https://acessguard.onrender.com/api/banking/transactions";
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use hardcoded risky data to simulate high-risk scenario
    const devicePosture = JSON.stringify({
      diskEncrypted: false,
      antivirus: false,
      isJailbroken: true,
    });

    const accessContext = JSON.stringify({
      impossibleTravel: true,
      country: "RU",
      isVPN: true,
      isTor: true,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: token,
      "x-device-posture": devicePosture,
      "x-access-context": accessContext,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Banking transactions error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }

    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
