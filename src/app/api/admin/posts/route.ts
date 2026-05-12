import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, fullName: true, email: true, role: true, batch: true },
      },
      _count: {
        select: { comments: true, likes: true },
      },
    },
  });

  return Response.json({ posts });
}

export async function PATCH(request: Request) {
  const user = await getSession();
  if (!user?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { postId, action } = body;

  if (!postId || !action) {
    return Response.json({ error: "Missing postId or action" }, { status: 400 });
  }

  switch (action) {
    case "togglePin": {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) return Response.json({ error: "Post not found" }, { status: 404 });
      await prisma.post.update({
        where: { id: postId },
        data: { isPinned: !post.isPinned },
      });
      return Response.json({ success: true, isPinned: !post.isPinned });
    }
    case "delete": {
      await prisma.postLike.deleteMany({ where: { postId } });
      await prisma.comment.deleteMany({ where: { postId } });
      await prisma.post.delete({ where: { id: postId } });
      return Response.json({ success: true });
    }
    default:
      return Response.json({ error: "Unknown action" }, { status: 400 });
  }
}
