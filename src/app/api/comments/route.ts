import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const postId = new URL(request.url).searchParams.get("postId");
  if (!postId) return Response.json({ error: "postId required" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    include: {
      author: { select: { id: true, fullName: true, batch: true, avatarUrl: true } },
      replies: {
        include: {
          author: { select: { id: true, fullName: true, batch: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ comments });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { text, postId, parentId } = await request.json();
  if (!text || !postId) {
    return Response.json({ error: "Text and postId are required." }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { text, authorId: user.id, postId, parentId },
    include: {
      author: { select: { id: true, fullName: true, batch: true, avatarUrl: true } },
    },
  });

  return Response.json({ comment });
}
