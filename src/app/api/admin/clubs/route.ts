import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const clubs = await prisma.club.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { members: true, posts: true, events: true, resources: true },
      },
    },
  });

  return Response.json({ clubs });
}

export async function PATCH(request: Request) {
  const user = await getSession();
  if (!user?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { clubId, action } = body;

  if (!clubId || !action) {
    return Response.json({ error: "Missing clubId or action" }, { status: 400 });
  }

  if (action === "delete") {
    await prisma.clubMember.deleteMany({ where: { clubId } });
    await prisma.post.updateMany({ where: { clubId }, data: { clubId: null } });
    await prisma.event.updateMany({ where: { clubId }, data: { clubId: null } });
    await prisma.resource.updateMany({ where: { clubId }, data: { clubId: null } });
    await prisma.club.delete({ where: { id: clubId } });
    return Response.json({ success: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
