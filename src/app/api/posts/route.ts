import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const batchId = searchParams.get("batchId");
  const clubId = searchParams.get("clubId");
  const cursor = searchParams.get("cursor");

  const where: Record<string, unknown> = {};
  if (batchId) where.batchId = batchId;
  if (clubId) where.clubId = clubId;

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { id: true, fullName: true, batch: true, role: true, avatarUrl: true } },
      comments: { select: { id: true } },
      likes: { select: { userId: true } },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 20,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  return Response.json({ posts });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body, type, batchId, clubId, imageUrl } = await request.json();

  if (!body) {
    return Response.json({ error: "Post body is required." }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      title,
      body,
      type: type || "General",
      imageUrl,
      authorId: user.id,
      batchId,
      clubId,
    },
    include: {
      author: { select: { id: true, fullName: true, batch: true, role: true, avatarUrl: true } },
      comments: { select: { id: true } },
      likes: { select: { userId: true } },
    },
  });

  return Response.json({ post });
}
