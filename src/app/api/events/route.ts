import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") || "upcoming";
  const clubId = searchParams.get("clubId");

  const now = new Date();
  const where: Record<string, unknown> = {};
  if (tab === "upcoming") where.startTime = { gte: now };
  else where.startTime = { lt: now };
  if (clubId) where.clubId = clubId;

  const events = await prisma.event.findMany({
    where,
    include: {
      club: { select: { id: true, name: true } },
      attendees: { select: { userId: true, status: true } },
    },
    orderBy: { startTime: tab === "upcoming" ? "asc" : "desc" },
    take: 50,
  });

  return Response.json({ events });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !user.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const data = await request.json();
  const event = await prisma.event.create({ data });
  return Response.json({ event });
}
