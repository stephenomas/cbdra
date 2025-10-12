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
        availableResources: true,
        image: true,
        role: true,
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
      availableResources,
      image,
    } = body

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        address,
        state,
        country,
        organization,
        availableResources,
        image,
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
        availableResources: true,
        image: true,
        role: true,
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