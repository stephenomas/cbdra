import { NextRequest, NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { s3Client, AWS_BUCKET } from "@/lib/aws"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.formData()
    const files: File[] = data.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    const uploadedFiles: string[] = []

    for (const file of files) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg", 
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/ogg"
      ]

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} not allowed` },
          { status: 400 }
        )
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "File size too large. Maximum 10MB allowed." },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `incidents/${timestamp}_${randomString}.${extension}`

      // Upload to AWS S3
      const uploadCommand = new PutObjectCommand({
        Bucket: AWS_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read", // Make files publicly accessible
      })

      await s3Client.send(uploadCommand)

      // Generate S3 URL
      const s3Url = `https://${AWS_BUCKET}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${filename}`
      uploadedFiles.push(s3Url)
    }

    return NextResponse.json({ 
      message: "Files uploaded successfully",
      files: uploadedFiles 
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    )
  }
}