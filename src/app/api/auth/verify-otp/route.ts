import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      )
    }

    // Find user with matching email and OTP
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      )
    }

    // Check if OTP exists
    if (!user.otp) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new one." },
        { status: 400 }
      )
    }

    // Check if OTP has expired
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Verify OTP
    if (user.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      )
    }

    // Update user as verified
    const verifiedUser = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        otp: null, // Clear OTP
        otpExpiry: null // Clear OTP expiry
      }
    })

    return NextResponse.json({
      message: "Email verified successfully! You can now sign in.",
      user: {
        id: verifiedUser.id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        role: verifiedUser.role,
        emailVerified: verifiedUser.emailVerified
      }
    })

  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}