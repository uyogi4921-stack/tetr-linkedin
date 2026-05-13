import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId: user.id, postId: id } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    return Response.json({ liked: false });
  }

  await prisma.postLike.create({ data: { userId: user.id, postId: id } });
  return Response.json({ liked: true });
}
