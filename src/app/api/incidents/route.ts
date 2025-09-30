import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IncidentType, IncidentStatus } from "@prisma/client"

// GET /api/incidents - Fetch incident reports based on user role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") as IncidentStatus | null
    const type = searchParams.get("type") as IncidentType | null

    const skip = (page - 1) * limit

    // Build where clause based on user role
    interface WhereClause {
      reporterId?: string;
      status?: IncidentStatus;
      type?: IncidentType;
    }
    
    let whereClause: WhereClause = {}

    if (session.user.role === "COMMUNITY_USER") {
      // Community users can only see their own reports
      whereClause.reporterId = session.user.id
    } else if (session.user.role === "ADMIN") {
      // Admin can see all reports
      whereClause = {}
    } else {
      // Volunteers, NGOs, and Government agencies can see all reports
      whereClause = {}
    }

    // Add filters
    if (status) {
      whereClause.status = status
    }
    if (type) {
      whereClause.type = type
    }

    const [incidents, total] = await Promise.all([
      prisma.incidentReport.findMany({
        where: whereClause,
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
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit,
      }),
      prisma.incidentReport.count({ where: whereClause })
    ])

    return NextResponse.json({
      incidents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching incidents:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/incidents - Create new incident report (Community users only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only community users can create incident reports
    if (session.user.role !== "COMMUNITY_USER") {
      return NextResponse.json(
        { error: "Only community users can submit incident reports" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      latitude,
      longitude,
      address,
      images,
      severity,
      affectedPeople
    } = body

    // Validate required fields
    if (!title || !description || !type || !address) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, type, address" },
        { status: 400 }
      )
    }

    // Validate incident type
    if (!Object.values(IncidentType).includes(type)) {
      return NextResponse.json(
        { error: "Invalid incident type" },
        { status: 400 }
      )
    }

    // Validate severity (1-5 scale)
    if (severity && (severity < 1 || severity > 5)) {
      return NextResponse.json(
        { error: "Severity must be between 1 and 5" },
        { status: 400 }
      )
    }

    const incident = await prisma.incidentReport.create({
      data: {
        title,
        description,
        type,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address,
        images: images || [],
        severity: severity || 1,
        affectedPeople: affectedPeople ? parseInt(affectedPeople) : null,
        reporterId: session.user.id,
        status: IncidentStatus.PENDING,
      },
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

    return NextResponse.json(incident, { status: 201 })

  } catch (error) {
    console.error("Error creating incident:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}