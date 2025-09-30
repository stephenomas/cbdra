-- CreateTable
CREATE TABLE "public"."ResourceAllocation" (
    "id" TEXT NOT NULL,
    "incidentReportId" TEXT NOT NULL,
    "allocatedToId" TEXT NOT NULL,
    "allocatedById" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceAllocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ResourceAllocation" ADD CONSTRAINT "ResourceAllocation_incidentReportId_fkey" FOREIGN KEY ("incidentReportId") REFERENCES "public"."IncidentReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResourceAllocation" ADD CONSTRAINT "ResourceAllocation_allocatedToId_fkey" FOREIGN KEY ("allocatedToId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResourceAllocation" ADD CONSTRAINT "ResourceAllocation_allocatedById_fkey" FOREIGN KEY ("allocatedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
