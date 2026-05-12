import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      batch: true,
      isAdmin: true,
      isVerified: true,
      onboardingComplete: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          comments: true,
          clubMembers: true,
        },
      },
    },
  });

  return Response.json({ users });
}

export async function PATCH(request: Request) {
  const user = await getSession();
  if (!user?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, action } = body;

  if (!userId || !action) {
    return Response.json({ error: "Missing userId or action" }, { status: 400 });
  }

  switch (action) {
    case "toggleAdmin": {
      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) return Response.json({ error: "User not found" }, { status: 404 });
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isAdmin: !target.isAdmin },
      });
      return Response.json({ success: true, isAdmin: updated.isAdmin });
    }
    case "toggleVerify": {
      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) return Response.json({ error: "User not found" }, { status: 404 });
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isVerified: !target.isVerified },
      });
      return Response.json({ success: true, isVerified: updated.isVerified });
    }
    case "changeRole": {
      const { role } = body;
      if (!role) return Response.json({ error: "Missing role" }, { status: 400 });
      await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
      return Response.json({ success: true });
    }
    case "delete": {
      if (userId === user.id) {
        return Response.json({ error: "Cannot delete yourself" }, { status: 400 });
      }
      await prisma.user.delete({ where: { id: userId } });
      return Response.json({ success: true });
    }
    default:
      return Response.json({ error: "Unknown action" }, { status: 400 });
  }
}
