-- CreateEnum
CREATE TYPE "public"."ResponseType" AS ENUM ('STATUS_UPDATE', 'FEEDBACK', 'STATUS_REPORT');

-- AlterTable
ALTER TABLE "public"."Response" ADD COLUMN     "challengesFaced" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "recommendations" TEXT,
ADD COLUMN     "successesHad" TEXT,
ADD COLUMN     "type" "public"."ResponseType" NOT NULL DEFAULT 'FEEDBACK';
