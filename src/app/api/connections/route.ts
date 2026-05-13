import { prisma } from "@/lib/db";
import { getSession, getSessionId } from "@/lib/auth";
import { NextRequest } from "next/server";

// GET: List connections for current user
export async function GET(request: NextRequest) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = request.nextUrl.searchParams.get("userId") || user.id;

  const connections = await prisma.connection.findMany({
    where: {
      OR: [
        { senderId: userId, status: "accepted" },
        { receiverId: userId, status: "accepted" },
      ],
    },
    include: {
      sender: { select: { id: true, fullName: true, batch: true, role: true, avatarUrl: true, aboutLine: true } },
      receiver: { select: { id: true, fullName: true, batch: true, role: true, avatarUrl: true, aboutLine: true } },
    },
  });

  // Also get pending requests received by the user
  const pendingReceived = await prisma.connection.findMany({
    where: { receiverId: user.id, status: "pending" },
    include: {
      sender: { select: { id: true, fullName: true, batch: true, role: true, avatarUrl: true, aboutLine: true } },
    },
  });

  // Also get pending requests sent by the user
  const pendingSent = await prisma.connection.findMany({
    where: { senderId: user.id, status: "pending" },
    include: {
      receiver: { select: { id: true, fullName: true, batch: true, role: true, avatarUrl: true, aboutLine: true } },
    },
  });

  return Response.json({ connections, pendingReceived, pendingSent });
}

// POST: Send a connection request
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId } = await request.json();

  if (!receiverId) {
    return Response.json({ error: "receiverId is required" }, { status: 400 });
  }

  if (receiverId === user.id) {
    return Response.json({ error: "Cannot connect with yourself" }, { status: 400 });
  }

  // Check if connection already exists in either direction
  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId: user.id, receiverId },
        { senderId: receiverId, receiverId: user.id },
      ],
    },
  });

  if (existing) {
    return Response.json({ error: "Connection already exists", connection: existing }, { status: 409 });
  }

  const connection = await prisma.connection.create({
    data: { senderId: user.id, receiverId },
  });

  // Create notification for the receiver
  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "connection",
      title: "New Connection Request",
      message: `${user.fullName} wants to connect with you.`,
      link: `/profile/${user.id}`,
    },
  });

  return Response.json({ connection });
}

// PATCH: Accept or reject a connection request
export async function PATCH(request: NextRequest) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { connectionId, action } = await request.json();

  if (!connectionId || !["accept", "reject", "withdraw"].includes(action)) {
    return Response.json({ error: "connectionId and action (accept/reject/withdraw) required" }, { status: 400 });
  }

  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });

  if (!connection) {
    return Response.json({ error: "Connection not found" }, { status: 404 });
  }

  // For accept/reject, only the receiver can do it
  if ((action === "accept" || action === "reject") && connection.receiverId !== user.id) {
    return Response.json({ error: "Only the receiver can accept/reject" }, { status: 403 });
  }

  // For withdraw, only the sender can do it
  if (action === "withdraw" && connection.senderId !== user.id) {
    return Response.json({ error: "Only the sender can withdraw" }, { status: 403 });
  }

  if (action === "reject" || action === "withdraw") {
    await prisma.connection.delete({ where: { id: connectionId } });
    return Response.json({ deleted: true });
  }

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: { status: "accepted" },
  });

  // Notify the sender that their request was accepted
  await prisma.notification.create({
    data: {
      userId: connection.senderId,
      type: "connection",
      title: "Connection Accepted",
      message: `${user.fullName} accepted your connection request.`,
      link: `/profile/${user.id}`,
    },
  });

  return Response.json({ connection: updated });
}
