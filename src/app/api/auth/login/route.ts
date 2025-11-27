import { mockLogin } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = mockLogin(email, password)

    if (!result) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 })
    }

    return Response.json(result, { status: 200 })
  } catch (error) {
    return Response.json({ error: "Authentication failed" }, { status: 500 })
  }
}
