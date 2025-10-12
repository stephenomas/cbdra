import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendAllocationEmail } from "@/lib/email"
import { Session } from "next-auth"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/incidents/[id]/allocate - Allocate resources to incident (Admin only)
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  let body: { allocatedToId?: string; resourceType?: string; description?: string; priority?: number } | null = null
  let session: Session | null = null
  
  try {
    session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin can allocate resources
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can allocate resources" },
        { status: 403 }
      )
    }

    body = await request.json()
    
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }
    
    const { allocatedToId, resourceType, description, priority } = body

    // Validate required fields
    if (!allocatedToId || !resourceType) {
      return NextResponse.json(
        { error: "Missing required fields: allocatedToId, resourceType" },
        { status: 400 }
      )
    }

    // Validate priority (1-5 scale)
    if (priority && (priority < 1 || priority > 5)) {
      return NextResponse.json(
        { error: "Priority must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Check if incident exists
    const incident = await prisma.incidentReport.findUnique({
      where: { id: id }
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    // Check if user to allocate exists and has appropriate role
    const userToAllocate = await prisma.user.findUnique({
      where: { id: allocatedToId },
      select: { id: true, name: true, role: true, organization: true, email: true }
    })

    if (!userToAllocate) {
      return NextResponse.json({ error: "User to allocate not found" }, { status: 404 })
    }

    // Validate that user has appropriate role for resource allocation
    const validRoles = ["VOLUNTEER", "NGO", "GOVERNMENT_AGENCY"]
    if (!validRoles.includes(userToAllocate.role)) {
      return NextResponse.json(
        { error: "Can only allocate resources to volunteers, NGOs, or government agencies" },
        { status: 400 }
      )
    }

    const allocation = await prisma.resourceAllocation.create({
      data: {
        incidentReportId: id,
        allocatedToId,
        allocatedById: session.user.id,
        resourceType,
        description,
        priority: priority || 1,
        status: "ASSIGNED"
      },
      include: {
        allocatedTo: {
          select: {
            id: true,
            name: true,
            role: true,
            organization: true,
            email: true,
          }
        },
        allocatedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        },
        incidentReport: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
          }
        }
      }
    })

    // Persist a notification for the allocated user
    try {
      await prisma.notification.create({
        data: {
          userId: allocatedToId,
          title: "New Incident Assigned",
          message: `${allocation.incidentReport.title} (Ref ${allocation.incidentReport.id})` + (allocation.priority ? ` • Priority ${allocation.priority}` : ""),
          type: "alert",
          incidentId: allocation.incidentReport.id,
          allocationId: allocation.id,
          read: false,
        }
      })
    } catch (err) {
      console.error('Failed to persist notification for allocation:', err)
    }

    // Fire-and-forget email notification to allocated user
    if (userToAllocate?.email) {
      sendAllocationEmail({
        toEmail: userToAllocate.email,
        toName: userToAllocate.name || undefined,
        incidentTitle: allocation.incidentReport.title,
        incidentId: allocation.incidentReport.id,
        allocationNote: description || undefined,
      }).catch((err) => {
        console.error('Failed to send allocation email notification:', err)
      })
    }

    return NextResponse.json(allocation, { status: 201 })

  } catch (error) {
    console.error("Error allocating resource:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      incidentId: id,
      requestBody: body,
      sessionUser: session?.user
    })
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET /api/incidents/[id]/allocate - Get resource allocations for incident
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

    const allocations = await prisma.resourceAllocation.findMany({
      where: { incidentReportId: id },
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
    })

    return NextResponse.json(allocations)

  } catch (error) {
    console.error("Error fetching allocations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}