-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "allergies" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "conditions" TEXT,
ADD COLUMN     "medicalAdditionalInfo" TEXT,
ADD COLUMN     "medications" TEXT;
