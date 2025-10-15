import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendOTPEmail, generateOTP, generateOTPExpiry } from "@/lib/email"

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

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: "User with this email already exists and is verified" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = generateOTPExpiry()

    // Create or update user with OTP
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || "COMMUNITY_USER",
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
      distanceWillingToTravel: typeof distanceWillingToTravel === 'number' 
        ? distanceWillingToTravel 
        : (distanceWillingToTravel ? Number(distanceWillingToTravel) : null),
      medications,
      allergies: allergies || "",
      conditions,
      medicalAdditionalInfo,
      otp,
      otpExpiry,
      emailVerified: null, // Not verified yet
      verified: false
    }

    let user
    if (existingUser) {
      // Update existing unverified user
      user = await prisma.user.update({
        where: { email },
        data: userData
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: userData
      })
    }

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, name)
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError)
      // Delete the user if email sending fails
      await prisma.user.delete({
        where: { id: user.id }
      })
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "OTP sent successfully. Please check your email.",
      email: email
    })

  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}