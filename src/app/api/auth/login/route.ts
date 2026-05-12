import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession(user.id);
  return Response.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      onboardingComplete: user.onboardingComplete,
    },
  });
}
