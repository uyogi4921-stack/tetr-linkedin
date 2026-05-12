import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const profile = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      batch: true,
      role: true,
      expertise: true,
      excitedField: true,
      aboutLine: true,
      avatarUrl: true,
      experienceLevel: true,
      isVerified: true,
      createdAt: true,
      clubMembers: {
        include: { club: { select: { id: true, name: true } } },
      },
      posts: {
        select: { id: true, title: true, body: true, type: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!profile) return Response.json({ error: "User not found" }, { status: 404 });
  return Response.json({ profile });
}
