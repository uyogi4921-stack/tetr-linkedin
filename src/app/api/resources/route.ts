import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const type = new URL(request.url).searchParams.get("type");
  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const resources = await prisma.resource.findMany({
    where,
    include: {
      club: { select: { id: true, name: true } },
      likes: { select: { userId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return Response.json({ resources });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const data = await request.json();
  const resource = await prisma.resource.create({ data });
  return Response.json({ resource });
}
