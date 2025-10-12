import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOTPEmail, generateOTP, generateOTPExpiry } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user
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

    // Generate new OTP
    const otp = generateOTP()
    const otpExpiry = generateOTPExpiry()

    // Update user with new OTP
    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry
      }
    })

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, user.name || undefined)
    } catch (emailError) {
      console.error("Failed to resend OTP email:", emailError)
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "OTP resent successfully. Please check your email."
    })

  } catch (error) {
    console.error("Resend OTP error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}