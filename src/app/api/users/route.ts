import { mockUsers } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    return Response.json(mockUsers, { status: 200 })
  } catch (error) {
    return Response.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
