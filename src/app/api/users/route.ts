import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const batch = searchParams.get("batch");
  const role = searchParams.get("role");
  const field = searchParams.get("field");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (batch) where.batch = batch;
  if (role) where.role = role;
  if (field) where.excitedField = field;
  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { expertise: { contains: search } },
      { excitedField: { contains: search } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
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
      experienceLevel: true,
    },
    orderBy: { fullName: "asc" },
    take: 50,
  });

  return Response.json({ users });
}
