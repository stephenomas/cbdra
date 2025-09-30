import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
  try {
    const session = await getServerSession(authOptions)
    
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

    const body = await request.json()
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
      select: { id: true, name: true, role: true, organization: true }
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

    return NextResponse.json(allocation, { status: 201 })

  } catch (error) {
    console.error("Error allocating resource:", error)
    return NextResponse.json(
      { error: "Internal server error" },
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