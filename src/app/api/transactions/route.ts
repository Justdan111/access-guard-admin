import { mockTransactions } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (userId) {
      const userTransactions = mockTransactions.filter((t) => t.userId === userId)
      return Response.json(userTransactions, { status: 200 })
    }

    return Response.json(mockTransactions, { status: 200 })
  } catch (error) {
    return Response.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
