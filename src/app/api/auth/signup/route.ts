import { NextRequest, NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const { 
      name,
      email,
      password,
      role,
      phone,
      address,
      state,
      country,
      organization,
      governmentId,
      ngoName,
      ngoFounder,
      availableResources,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactAddress,
      emergencyContactRelationship,
      distanceWillingToTravel,
      // Medical ID fields
      medications,
      allergies,
      conditions,
      medicalAdditionalInfo
    } = await request.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Validate password special character
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/
    if (!specialCharRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one special character" },
        { status: 400 }
      )
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    // Role-specific validations
    if (role === "GOVERNMENT_AGENCY" && !governmentId) {
      return NextResponse.json(
        { error: "Government ID is required for Government Agency" },
        { status: 400 }
      )
    }

    if (role === "NGO" && (!ngoName || !ngoFounder)) {
      return NextResponse.json(
        { error: "NGO Name and NGO Founder are required for NGO" },
        { status: 400 }
      )
    }

    if (role !== "COMMUNITY_USER" && !availableResources) {
      return NextResponse.json(
        { error: "Available Resources is required for non-community roles" },
        { status: 400 }
      )
    }

    // Community user medical validations
    if (role === "COMMUNITY_USER" && !allergies) {
      return NextResponse.json(
        { error: "Allergies is required for Community Users" },
        { status: 400 }
      )
    }

    // Forward to send-otp API
    const otpResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        phone,
        address,
        state,
        country,
        organization,
        governmentId,
        ngoName,
        ngoFounder,
        availableResources,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactAddress,
        emergencyContactRelationship,
        distanceWillingToTravel,
        medications,
        allergies,
        conditions,
        medicalAdditionalInfo
      })
    })

    const otpData = await otpResponse.json()

    if (!otpResponse.ok) {
      return NextResponse.json(
        { error: otpData.error },
        { status: otpResponse.status }
      )
    }

    return NextResponse.json(
      { 
        message: "Please check your email for verification code",
        email: email,
        requiresVerification: true
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}