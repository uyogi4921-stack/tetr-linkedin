import { prisma } from "@/lib/db";
import { getSession, getSessionId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const profile = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      batch: true,
      role: true,
      expertise: true,
      excitedField: true,
      aboutLine: true,
      avatarUrl: true,
      coverImageUrl: true,
      resumeUrl: true,
      experienceLevel: true,
      isVerified: true,
      createdAt: true,
      clubMembers: {
        include: { club: { select: { id: true, name: true } } },
      },
      posts: {
        select: { id: true, title: true, body: true, type: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!profile) return Response.json({ error: "User not found" }, { status: 404 });

  // Get connection status between current user and this profile
  let connectionStatus = null;
  let connectionId = null;
  if (user.id !== id) {
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: id },
          { senderId: id, receiverId: user.id },
        ],
      },
    });
    if (connection) {
      connectionStatus = connection.status;
      connectionId = connection.id;
      // Add direction info
      if (connection.senderId === user.id) {
        connectionStatus = connection.status === "pending" ? "pending_sent" : connection.status;
      } else {
        connectionStatus = connection.status === "pending" ? "pending_received" : connection.status;
      }
    }
  }

  // Connection count
  const connectionCount = await prisma.connection.count({
    where: {
      OR: [
        { senderId: id, status: "accepted" },
        { receiverId: id, status: "accepted" },
      ],
    },
  });

  return Response.json({ profile, connectionStatus, connectionId, connectionCount });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Users can only edit their own profile
  if (user.id !== id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  // Whitelist editable fields
  const allowedFields = ["fullName", "aboutLine", "expertise", "excitedField", "experienceLevel", "resumeUrl", "phone", "batch", "avatarUrl", "coverImageUrl"];
  const data: Record<string, string | null> = {};

  for (const field of allowedFields) {
    if (field in body) {
      data[field] = body[field] || null;
    }
  }

  // fullName cannot be empty
  if ("fullName" in data && !data.fullName) {
    return Response.json({ error: "Full name is required" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      batch: true,
      role: true,
      expertise: true,
      excitedField: true,
      aboutLine: true,
      avatarUrl: true,
      coverImageUrl: true,
      resumeUrl: true,
      experienceLevel: true,
      isAdmin: true,
      onboardingComplete: true,
    },
  });

  return Response.json({ user: updated });
}
