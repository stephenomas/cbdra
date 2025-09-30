import { S3Client } from "@aws-sdk/client-s3"

// Configure AWS S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === "true",
})

export const AWS_BUCKET = process.env.AWS_BUCKET || "khrimisay"