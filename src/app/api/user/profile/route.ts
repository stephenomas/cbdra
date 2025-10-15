import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        state: true,
        country: true,
        organization: true,
        governmentId: true,
        ngoName: true,
        ngoFounder: true,
        availableResources: true,
        image: true,
        role: true,
        verified: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        emergencyContactAddress: true,
        emergencyContactRelationship: true,
        distanceWillingToTravel: true,
        // Medical ID fields
        medications: true,
        allergies: true,
        conditions: true,
        medicalAdditionalInfo: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Profile GET error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      address,
      state,
      country,
      organization,
      governmentId, // ignored in update to enforce read-only
      ngoName,
      ngoFounder,
      availableResources,
      image,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactAddress,
      emergencyContactRelationship,
      distanceWillingToTravel,
      // Medical ID fields
      medications,
      allergies,
      conditions,
      medicalAdditionalInfo,
    } = body

    // Fetch user to determine role-based constraints
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Validate medical constraints
    if (currentUser.role === "COMMUNITY_USER") {
      const allergiesVal = typeof allergies === 'string' ? allergies.trim() : (allergies ?? "")
      if (!allergiesVal) {
        return NextResponse.json(
          { error: "Allergies is required for community users" },
          { status: 400 }
        )
      }
    }

    // Determine emergency contact values based on role
    let ecName = emergencyContactName ?? null
    let ecPhone = emergencyContactPhone ?? null
    let ecAddress = emergencyContactAddress ?? null
    let ecRelationship = emergencyContactRelationship ?? null

    if (currentUser.role === "GOVERNMENT_AGENCY" || currentUser.role === "NGO") {
      ecName = null
      ecPhone = null
      ecAddress = null
      ecRelationship = null
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        address,
        state,
        country,
        organization,
        // governmentId is intentionally NOT updated here to enforce read-only in profile updates
        ngoName,
        ngoFounder,
        availableResources,
        image,
        emergencyContactName: ecName,
        emergencyContactPhone: ecPhone,
        emergencyContactAddress: ecAddress,
        emergencyContactRelationship: ecRelationship,
        distanceWillingToTravel: typeof distanceWillingToTravel === 'number' ? distanceWillingToTravel : (distanceWillingToTravel ? Number(distanceWillingToTravel) : null),
        // Medical ID fields
        medications,
        allergies: allergies ?? "",
        conditions,
        medicalAdditionalInfo,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        state: true,
        country: true,
        organization: true,
        governmentId: true,
        ngoName: true,
        ngoFounder: true,
        availableResources: true,
        image: true,
        role: true,
        verified: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        emergencyContactAddress: true,
        emergencyContactRelationship: true,
        distanceWillingToTravel: true,
        // Medical ID fields
        medications: true,
        allergies: true,
        conditions: true,
        medicalAdditionalInfo: true,
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Profile PUT error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}