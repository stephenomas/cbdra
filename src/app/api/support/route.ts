import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendSupportEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json().catch(() => null)

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { name, email, message } = body as {
      name?: string
      email?: string
      message?: string
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const fromName = name || session?.user?.name || undefined
    const fromEmail = email || session?.user?.email || undefined
    const role = session?.user?.role
    const userId = session?.user?.id

    await sendSupportEmail({
      fromName,
      fromEmail,
      role,
      userId,
      message,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Support API error:", error)
    return NextResponse.json({ error: "Failed to send support request" }, { status: 500 })
  }
}