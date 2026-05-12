import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const events = await prisma.event.findMany({
    orderBy: { startTime: "desc" },
    include: {
      club: { select: { id: true, name: true } },
      _count: { select: { attendees: true } },
    },
  });

  return Response.json({ events });
}

export async function PATCH(request: Request) {
  const user = await getSession();
  if (!user?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { eventId, action } = body;

  if (!eventId || !action) {
    return Response.json({ error: "Missing eventId or action" }, { status: 400 });
  }

  if (action === "delete") {
    await prisma.eventAttendee.deleteMany({ where: { eventId } });
    await prisma.event.delete({ where: { id: eventId } });
    return Response.json({ success: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
