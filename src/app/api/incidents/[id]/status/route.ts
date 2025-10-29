import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IncidentStatus, ResponseType } from "@prisma/client"

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

    // Check if user has permission to update status
    const allowedRoles = ["VOLUNTEER", "NGO", "GOVERNMENT_AGENCY", "ADMIN", "COMMUNITY_USER"]
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { status, message } = await request.json()

    if (!status || !message) {
      return NextResponse.json(
        { error: "Status and message are required" },
        { status: 400 }
      )
    }

    // Normalize and validate status against Prisma enum
    const normalizedStatus = String(status).toUpperCase().replace(/\s+/g, "_") as IncidentStatus
    const validStatuses: IncidentStatus[] = [
      "PENDING",
      "VERIFIED",
      "IN_PROGRESS",
      "RESOLVED",
      "REJECTED",
    ] as unknown as IncidentStatus[]

    if (!validStatuses.includes(normalizedStatus)) {
      return NextResponse.json(
        { error: `Invalid status value '${status}'. Expected one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    // Verify incident exists
    const incident = await prisma.incidentReport.findUnique({
      where: { id }
    })

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      )
    }

    // Update incident status
    const updatedIncident = await prisma.incidentReport.update({
      where: { id },
      data: {
        status: normalizedStatus,
        updatedAt: new Date()
      }
    })

    // Create response record for status update
    await prisma.response.create({
      data: {
        incidentReportId: id,
        responderId: session.user.id,
        message: `Status updated to ${normalizedStatus}: ${message}`,
        type: ResponseType.STATUS_UPDATE,
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      incident: updatedIncident
    })

  } catch (error) {
    console.error("Error updating incident status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}