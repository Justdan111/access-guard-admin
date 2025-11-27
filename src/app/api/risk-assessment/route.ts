import { assessUserRisk } from "@/lib/zero-trust-engine"
import { mockUsers, mockDevicePostures } from "@/lib/mock-data"

export async function POST(request: Request) {
  try {
    const { userId, transactionAmount } = await request.json()

    const user = mockUsers.find((u) => u.id === userId)
    const devicePosture = mockDevicePostures.find((d) => d.deviceId === user?.deviceId)

    if (!user || !devicePosture) {
      return Response.json({ error: "User or device not found" }, { status: 404 })
    }

    const assessment = assessUserRisk(user, devicePosture, transactionAmount)
    return Response.json(assessment, { status: 200 })
  } catch (error) {
    return Response.json({ error: "Risk assessment failed" }, { status: 500 })
  }
}
