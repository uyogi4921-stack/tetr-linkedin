import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const hackathon = await prisma.hackathon.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, fullName: true } },
      teams: {
        include: {
          creator: { select: { id: true, fullName: true } },
          members: {
            include: {
              user: { select: { id: true, fullName: true, avatarUrl: true, batch: true } },
            },
            orderBy: { joinedAt: "asc" },
          },
          requirements: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!hackathon) {
    return Response.json({ error: "Hackathon not found" }, { status: 404 });
  }

  return Response.json({ hackathon });
}
