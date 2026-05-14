import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { reason } = await request.json();

  if (!reason) {
    return Response.json({ error: "Reason is required" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.authorId === user.id) {
    return Response.json({ error: "You cannot report your own post" }, { status: 400 });
  }

  // Check if already reported
  const existing = await prisma.report.findUnique({
    where: { userId_postId: { userId: user.id, postId: id } },
  });

  if (existing) {
    return Response.json({ error: "You have already reported this post" }, { status: 409 });
  }

  await prisma.report.create({
    data: { reason, postId: id, userId: user.id },
  });

  return Response.json({ success: true });
}
