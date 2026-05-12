import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fullName, email, phone, password, batch } = body;

  if (!fullName || !email || !password) {
    return Response.json({ error: "Full name, email, and password are required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { fullName, email, phone, password: hashed, batch },
  });

  await createSession(user.id);
  return Response.json({ user: { id: user.id, fullName: user.fullName, email: user.email } });
}
