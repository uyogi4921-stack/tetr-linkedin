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
  const { role, country } = await request.json();

  if (!role) {
    return Response.json({ error: "Your role is required." }, { status: 400 });
  }

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

  if (team.isFull) {
    return Response.json({ error: "This team is already full." }, { status: 400 });
  }

  // Check if user already in a team for this hackathon
  const existingMembership = await prisma.hackathonTeamMember.findFirst({
    where: {
      userId: user.id,
      team: { hackathonId },
    },
  });

  if (existingMembership) {
    return Response.json({ error: "You are already in a team for this hackathon." }, { status: 409 });
  }

  // Add member
  await prisma.hackathonTeamMember.create({
    data: {
      teamId,
      userId: user.id,
      role,
      country,
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
