import { prisma } from "@/lib/db";
import { getSessionId, getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const hackathons = await prisma.hackathon.findMany({
    orderBy: { startDate: "desc" },
    include: {
      creator: { select: { id: true, fullName: true } },
      teams: {
        select: { id: true, members: { select: { id: true } } },
      },
    },
  });

  const result = hackathons.map((h) => ({
    ...h,
    teamCount: h.teams.length,
    totalParticipants: h.teams.reduce((acc, t) => acc + t.members.length, 0),
    teams: undefined,
  }));

  return Response.json({ hackathons: result });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !user.isAdmin) {
    return Response.json({ error: "Admin only" }, { status: 403 });
  }

  const { title, description, startDate, endDate, maxTeamSize } = await request.json();

  if (!title || !startDate || !endDate) {
    return Response.json({ error: "Title, start date, and end date are required." }, { status: 400 });
  }

  const hackathon = await prisma.hackathon.create({
    data: {
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxTeamSize: maxTeamSize || 4,
      createdBy: user.id,
    },
  });

  return Response.json({ hackathon });
}
