import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const otherId = new URL(request.url).searchParams.get("with");

  if (otherId) {
    // Fetch conversation with a specific user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: otherId },
          { senderId: otherId, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: { senderId: otherId, receiverId: user.id, isRead: false },
      data: { isRead: true },
    });

    return Response.json({ messages });
  }

  // Fetch thread list — get the latest message per conversation partner
  // Use raw query for efficiency: get distinct conversation partners with latest message
  const conversations = await prisma.message.findMany({
    where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      sender: { select: { id: true, fullName: true, avatarUrl: true, batch: true } },
      receiver: { select: { id: true, fullName: true, avatarUrl: true, batch: true } },
    },
  });

  // Deduplicate to one message per conversation
  const seen = new Set<string>();
  const threads = conversations.filter((msg) => {
    const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
    if (seen.has(otherId)) return false;
    seen.add(otherId);
    return true;
  });

  return Response.json({ threads });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { text, receiverId } = await request.json();
  if (!text || !receiverId) {
    return Response.json({ error: "Text and receiverId required." }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { text, senderId: user.id, receiverId },
  });

  // Create notification for the receiver
  // Only create if last notification to this user from this sender was > 1 min ago
  // (avoid spamming notifications for rapid messages)
  const recentNotif = await prisma.notification.findFirst({
    where: {
      userId: receiverId,
      type: "message",
      link: `/messages?with=${user.id}`,
      createdAt: { gte: new Date(Date.now() - 60000) },
    },
  });

  if (!recentNotif) {
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "message",
        title: "New Message",
        message: `${user.fullName}: ${text.length > 50 ? text.slice(0, 50) + "..." : text}`,
        link: `/messages?with=${user.id}`,
      },
    });
  }

  return Response.json({ message });
}
