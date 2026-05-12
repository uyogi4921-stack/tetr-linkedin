import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const clubs = await prisma.club.findMany({
    include: {
      members: { select: { userId: true } },
      _count: { select: { posts: true, events: true, members: true } },
    },
    orderBy: { name: "asc" },
  });

  return Response.json({ clubs });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !user.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const data = await request.json();
  const club = await prisma.club.create({ data });
  return Response.json({ club });
}
