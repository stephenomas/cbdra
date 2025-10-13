-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "distanceWillingToTravel" INTEGER,
ADD COLUMN     "emergencyContactAddress" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelationship" TEXT;
