import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user has permission to give status reports
    const allowedRoles = ["COMMUNITY_USER", "VOLUNTEER", "NGO", "GOVERNMENT_AGENCY"]
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "You don't have permission to submit status reports" },
        { status: 403 }
      )
    }

    const { message, challengesFaced, successesHad, recommendations, images } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Status report message is required" },
        { status: 400 }
      )
    }

    // Verify incident exists and is in progress
    const incident = await prisma.incidentReport.findUnique({
      where: { id }
    })

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      )
    }

    if (incident.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Status reports can only be provided for incidents in progress" },
        { status: 400 }
      )
    }

    // Create status report as a response with new schema fields
    const statusReport = await prisma.response.create({
      data: {
        incidentReportId: id,
        responderId: session.user.id,
        message: message,
        type: "STATUS_REPORT",
        challengesFaced: challengesFaced || null,
        successesHad: successesHad || null,
        recommendations: recommendations || null,
        images: images || [],
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      statusReport: statusReport
    })

  } catch (error) {
    console.error("Error submitting status report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
