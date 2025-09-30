import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IncidentStatus } from "@prisma/client"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/incidents/[id] - Get specific incident
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const incident = await prisma.incidentReport.findUnique({
      where: { id: id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        responses: {
          include: {
            responder: {
              select: {
                id: true,
                name: true,
                role: true,
                organization: true,
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        },
        resourceAllocations: {
          include: {
            allocatedTo: {
              select: {
                id: true,
                name: true,
                role: true,
                organization: true,
              }
            },
            allocatedBy: {
              select: {
                id: true,
                name: true,
                role: true,
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    // Check access permissions
    if (session.user.role === "COMMUNITY_USER" && incident.reporterId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json(incident)

  } catch (error) {
    console.error("Error fetching incident:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/incidents/[id] - Update incident (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin can update incidents
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can update incidents" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, severity, assignedTo } = body

    // Validate status if provided
    if (status && !Object.values(IncidentStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    // Check if incident exists
    const existingIncident = await prisma.incidentReport.findUnique({
      where: { id: id },
    })

    if (!existingIncident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      )
    }

    const updateData: {
      status?: IncidentStatus;
      severity?: number;
      assignedTo?: string;
    } = {}

    if (status) {
      updateData.status = status
    }
    if (severity) {
      updateData.severity = severity
    }
    if (assignedTo) {
      updateData.assignedTo = assignedTo
    }

    const incident = await prisma.incidentReport.update({
      where: { id: id },
      data: updateData,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      }
    })

    return NextResponse.json(incident)

  } catch (error) {
    console.error("Error updating incident:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/incidents/[id] - Delete incident (Admin or reporter only)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const incident = await prisma.incidentReport.findUnique({
      where: { id: id },
      select: { reporterId: true }
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    // Only admin or the reporter can delete the incident
    if (session.user.role !== "ADMIN" && incident.reporterId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    await prisma.incidentReport.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "Incident deleted successfully" })

  } catch (error) {
    console.error("Error deleting incident:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}