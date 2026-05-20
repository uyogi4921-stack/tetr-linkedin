import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: hackathonId, teamId } = await params;
  const { userId, role, country } = await request.json();

  if (!userId || !role) {
    return Response.json({ error: "User and role are required." }, { status: 400 });
  }

  // Verify team exists and belongs to this hackathon
  const team = await prisma.hackathonTeam.findUnique({
    where: { id: teamId },
    include: {
      members: true,
      hackathon: true,
    },
  });

  if (!team || team.hackathonId !== hackathonId) {
    return Response.json({ error: "Team not found" }, { status: 404 });
  }

  // Only team creator can add members
  if (team.createdBy !== user.id) {
    return Response.json({ error: "Only the team lead can add members." }, { status: 403 });
  }

  if (team.isFull) {
    return Response.json({ error: "This team is already full." }, { status: 400 });
  }

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  // Check if target user is already in a team for this hackathon
  const existingMembership = await prisma.hackathonTeamMember.findFirst({
    where: {
      userId,
      team: { hackathonId },
    },
  });

  if (existingMembership) {
    return Response.json({ error: `${targetUser.fullName} is already in a team for this hackathon.` }, { status: 409 });
  }

  // Add member
  await prisma.hackathonTeamMember.create({
    data: {
      teamId,
      userId,
      role,
      country: country || null,
    },
  });

  // Check if team is now full
  const memberCount = team.members.length + 1;
  if (memberCount >= team.hackathon.maxTeamSize) {
    await prisma.hackathonTeam.update({
      where: { id: teamId },
      data: { isFull: true },
    });
  }

  return Response.json({ success: true });
}
