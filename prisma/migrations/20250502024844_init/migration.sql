-- CreateTable
CREATE TABLE "LinkedInProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "profileName" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "optimizationScore" INTEGER NOT NULL,
    "analysisResults" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkedInProfile_userId_idx" ON "LinkedInProfile"("userId");

-- CreateIndex
CREATE INDEX "LinkedInProfile_createdAt_idx" ON "LinkedInProfile"("createdAt");

-- AddForeignKey
ALTER TABLE "LinkedInProfile" ADD CONSTRAINT "LinkedInProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
