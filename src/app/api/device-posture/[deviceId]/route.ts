import { mockDevicePostures } from "@/lib/mock-data"

export async function GET(request: Request, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params
    const posture = mockDevicePostures.find((p) => p.deviceId === deviceId)

    if (!posture) {
      return Response.json({ error: "Device posture not found" }, { status: 404 })
    }

    return Response.json(posture, { status: 200 })
  } catch (error) {
    return Response.json({ error: "Failed to fetch device posture" }, { status: 500 })
  }
}
