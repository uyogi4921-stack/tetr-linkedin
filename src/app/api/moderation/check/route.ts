import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/auth";
import { NextRequest } from "next/server";

const BLOCKED_PATTERNS = [
  /\b(spam|buy now|click here|limited offer)\b/i,
  /\b(hate|kill|attack|threaten)\b/i,
  /\b(political party|vote for|election)\b/i,
];

export async function POST(request: NextRequest) {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await request.json();
  if (!text) return Response.json({ approved: true });

  const rules = await prisma.rule.findMany({ where: { isActive: true } });

  const violations: string[] = [];

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      violations.push("Content may contain inappropriate language or spam.");
      break;
    }
  }

  if (text.length > 5000) {
    violations.push("Post exceeds maximum length (5000 characters).");
  }

  return Response.json({
    approved: violations.length === 0,
    violations,
    rules: rules.map((r) => r.text),
  });
}
