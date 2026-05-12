import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const rules = await prisma.rule.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ rules });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { text } = body;

  if (!text?.trim()) {
    return Response.json({ error: "Rule text is required" }, { status: 400 });
  }

  const rule = await prisma.rule.create({
    data: { text: text.trim() },
  });

  return Response.json({ rule });
}

export async function PATCH(request: Request) {
  const user = await getSession();
  if (!user?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { ruleId, action } = body;

  if (!ruleId || !action) {
    return Response.json({ error: "Missing ruleId or action" }, { status: 400 });
  }

  if (action === "toggle") {
    const rule = await prisma.rule.findUnique({ where: { id: ruleId } });
    if (!rule) return Response.json({ error: "Rule not found" }, { status: 404 });
    const updated = await prisma.rule.update({
      where: { id: ruleId },
      data: { isActive: !rule.isActive },
    });
    return Response.json({ success: true, isActive: updated.isActive });
  }

  if (action === "delete") {
    await prisma.rule.delete({ where: { id: ruleId } });
    return Response.json({ success: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
