import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: hackathonId } = await params;
  const { teamName, description, role, country, requirements } = await request.json();

  if (!teamName || !role) {
    return Response.json({ error: "Team name and your role are required." }, { status: 400 });
  }

  const hackathon = await prisma.hackathon.findUnique({ where: { id: hackathonId } });
  if (!hackathon) {
    return Response.json({ error: "Hackathon not found" }, { status: 404 });
  }

  // Check if user already has a team in this hackathon
  const existingMembership = await prisma.hackathonTeamMember.findFirst({
    where: {
      userId: user.id,
      team: { hackathonId },
    },
  });

  if (existingMembership) {
    return Response.json({ error: "You are already in a team for this hackathon." }, { status: 409 });
  }

  // Create team + add creator as first member + add requirements
  const team = await prisma.hackathonTeam.create({
    data: {
      hackathonId,
      teamName,
      description,
      createdBy: user.id,
      members: {
        create: {
          userId: user.id,
          role,
          country,
        },
      },
      requirements: requirements?.length
        ? {
            createMany: {
              data: requirements.map((r: { skillNeeded: string; countryPreferred?: string; spotsAvailable?: number }) => ({
                skillNeeded: r.skillNeeded,
                countryPreferred: r.countryPreferred || null,
                spotsAvailable: r.spotsAvailable || 1,
              })),
            },
          }
        : undefined,
    },
    include: {
      members: {
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
      },
      requirements: true,
    },
  });

  return Response.json({ team });
}
