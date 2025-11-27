import { mockDevicePostures } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    return Response.json(mockDevicePostures, { status: 200 })
  } catch (error) {
    return Response.json({ error: "Failed to fetch device posture" }, { status: 500 })
  }
}
