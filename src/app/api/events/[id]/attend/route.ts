import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await request.json();

  const existing = await prisma.eventAttendee.findUnique({
    where: { userId_eventId: { userId: user.id, eventId: id } },
  });

  if (existing) {
    if (existing.status === status) {
      await prisma.eventAttendee.delete({ where: { id: existing.id } });
      return Response.json({ attending: null });
    }
    const updated = await prisma.eventAttendee.update({
      where: { id: existing.id },
      data: { status },
    });
    return Response.json({ attending: updated.status });
  }

  await prisma.eventAttendee.create({ data: { userId: user.id, eventId: id, status } });
  return Response.json({ attending: status });
}
