-- CreateTable
CREATE TABLE "Hackathon" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "maxTeamSize" INTEGER NOT NULL DEFAULT 4,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hackathon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HackathonTeam" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "description" TEXT,
    "isFull" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HackathonTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HackathonTeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "country" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HackathonTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HackathonTeamRequirement" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "skillNeeded" TEXT NOT NULL,
    "countryPreferred" TEXT,
    "spotsAvailable" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "HackathonTeamRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HackathonTeamMember_teamId_userId_key" ON "HackathonTeamMember"("teamId", "userId");

-- AddForeignKey
ALTER TABLE "Hackathon" ADD CONSTRAINT "Hackathon_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackathonTeam" ADD CONSTRAINT "HackathonTeam_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackathonTeam" ADD CONSTRAINT "HackathonTeam_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackathonTeamMember" ADD CONSTRAINT "HackathonTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "HackathonTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackathonTeamMember" ADD CONSTRAINT "HackathonTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackathonTeamRequirement" ADD CONSTRAINT "HackathonTeamRequirement_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "HackathonTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
