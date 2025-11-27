import { NextRequest, NextResponse } from "next/server";

interface BankingTransaction {
  id: number;
  from: string;
  to: string;
  amount: number;
  status: "completed" | "pending";
  type: string;
  time: string;
}

interface BankingTransactionsResponse {
  app: string;
  user: string;
  transactions: BankingTransaction[];
  totalTransactions: number;
  totalIncome: number;
  totalOutgoings: number;
  netFlow: number;
}

export async function GET(request: NextRequest) {
  try {
    const backendUrl =
      "https://acessguard.onrender.com/api/banking/transactions";
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Forward device context headers from client
    const devicePosture = request.headers.get("x-device-posture");
    const accessContext = request.headers.get("x-access-context");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: token,
    };

    if (devicePosture) {
      headers["x-device-posture"] = devicePosture;
    }
    if (accessContext) {
      headers["x-access-context"] = accessContext;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch transactions from backend" },
        { status: response.status }
      );
    }

    const data: BankingTransactionsResponse = await response.json();
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
