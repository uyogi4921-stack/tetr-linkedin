import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.clubMember.findUnique({
    where: { userId_clubId: { userId: user.id, clubId: id } },
  });

  if (existing) {
    await prisma.clubMember.delete({ where: { id: existing.id } });
    return Response.json({ joined: false });
  }

  await prisma.clubMember.create({ data: { userId: user.id, clubId: id } });
  return Response.json({ joined: true });
}
