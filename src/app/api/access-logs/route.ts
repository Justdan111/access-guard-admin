import { mockAccessLogs } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const logs = mockAccessLogs.slice(0, limit)
    return Response.json(logs, { status: 200 })
  } catch (error) {
    return Response.json({ error: "Failed to fetch access logs" }, { status: 500 })
  }
}
