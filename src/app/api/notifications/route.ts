import { prisma } from "@/lib/db";
import { getSession, getSessionId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return Response.json({ notifications });
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (id) {
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
  } else {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
  }

  return Response.json({ success: true });
}
