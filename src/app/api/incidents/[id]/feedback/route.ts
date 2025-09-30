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

    const { message, rating, images } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Feedback message is required" },
        { status: 400 }
      )
    }

    // Verify incident exists and is resolved
    const incident = await prisma.incidentReport.findUnique({
      where: { id }
    })

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      )
    }

    if (incident.status !== "RESOLVED") {
      return NextResponse.json(
        { error: "Feedback can only be provided for resolved incidents" },
        { status: 400 }
      )
    }

    // Create feedback as a response
    const feedback = await prisma.response.create({
      data: {
        incidentReportId: id,
        responderId: session.user.id,
        message: `Feedback (Rating: ${rating}/5): ${message}`,
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      feedback: feedback
    })

  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}