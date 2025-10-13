import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Decision = "ACCEPT" | "DECLINE"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json().catch(() => null) as { decision?: Decision }
    const decision = body?.decision

    if (!decision || (decision !== "ACCEPT" && decision !== "DECLINE")) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, verified: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const vettableRoles = ["VOLUNTEER", "NGO", "GOVERNMENT_AGENCY"]
    if (!vettableRoles.includes(user.role)) {
      return NextResponse.json({ error: "User role not eligible for vetting" }, { status: 400 })
    }

    if (decision === "ACCEPT") {
      if (user.verified) {
        return NextResponse.json({ error: "User already verified" }, { status: 400 })
      }
      await prisma.user.update({
        where: { id },
        data: { verified: true }
      })
      await prisma.notification.create({
        data: {
          userId: id,
          title: "Verification Approved",
          message: `Your account has been verified by the administrator.`,
          type: "success",
        }
      })
      return NextResponse.json({ success: true, status: "verified" })
    } else {
      // DECLINE keeps verified false
      if (!user.verified) {
        // still send a decline notification
        await prisma.notification.create({
          data: {
            userId: id,
            title: "Verification Declined",
            message: `Your verification request was declined by the administrator.`,
            type: "alert",
          }
        })
        return NextResponse.json({ success: true, status: "declined" })
      } else {
        // Edge: declining a previously verified user sets back to unverified
        await prisma.user.update({
          where: { id },
          data: { verified: false }
        })
        await prisma.notification.create({
          data: {
            userId: id,
            title: "Verification Revoked",
            message: `Your verification status has been revoked by the administrator.`,
            type: "alert",
          }
        })
        return NextResponse.json({ success: true, status: "revoked" })
      }
    }

  } catch (error) {
    console.error("Vet user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}