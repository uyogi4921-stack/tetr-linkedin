import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, fullName: true, batch: true, avatarUrl: true } } },
      },
      posts: {
        include: {
          author: { select: { id: true, fullName: true, batch: true, avatarUrl: true } },
          comments: { select: { id: true } },
          likes: { select: { userId: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      events: {
        orderBy: { startTime: "asc" },
        take: 10,
      },
      resources: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!club) return Response.json({ error: "Club not found" }, { status: 404 });
  return Response.json({ club });
}
