import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only relevant for NGO, Volunteer, and Government Agency
    const allowedRoles = ["NGO", "VOLUNTEER", "GOVERNMENT_AGENCY"]
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ total: 0, pending: 0, completed: 0 })
    }

    const userId = session.user.id

    const [total, pending, completed] = await Promise.all([
      prisma.resourceAllocation.count({
        where: { allocatedToId: userId }
      }),
      prisma.resourceAllocation.count({
        where: { allocatedToId: userId, status: "ASSIGNED" }
      }),
      prisma.resourceAllocation.count({
        where: { allocatedToId: userId, status: "COMPLETED" }
      })
    ])

    return NextResponse.json({ total, pending, completed })
  } catch (error) {
    console.error("Error fetching allocation stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}