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

  const team = await prisma.hackathonTeam.findUnique({
    where: { id: teamId },
    include: { members: true },
  });

  if (!team || team.hackathonId !== hackathonId) {
    return Response.json({ error: "Team not found" }, { status: 404 });
  }

  // Check if user is in this team
  const membership = team.members.find((m) => m.userId === user.id);
  if (!membership) {
    return Response.json({ error: "You are not in this team." }, { status: 400 });
  }

  // If user is the team lead and there are other members, transfer lead to next member
  if (team.createdBy === user.id && team.members.length > 1) {
    const nextLead = team.members.find((m) => m.userId !== user.id);
    if (nextLead) {
      await prisma.hackathonTeam.update({
        where: { id: teamId },
        data: { createdBy: nextLead.userId },
      });
    }
  }

  // Remove the member
  await prisma.hackathonTeamMember.delete({
    where: { id: membership.id },
  });

  // If team is now empty, delete the team entirely
  if (team.members.length <= 1) {
    await prisma.hackathonTeamRequirement.deleteMany({ where: { teamId } });
    await prisma.hackathonTeam.delete({ where: { id: teamId } });
    return Response.json({ success: true, teamDeleted: true });
  }

  // If team was full, mark it as not full now
  if (team.isFull) {
    await prisma.hackathonTeam.update({
      where: { id: teamId },
      data: { isFull: false },
    });
  }

  return Response.json({ success: true });
}
