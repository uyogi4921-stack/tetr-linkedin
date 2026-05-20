import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fullName, email, phone, password, batch } = body;

  if (!fullName || !email || !password) {
    return Response.json({ error: "Full name, email, and password are required." }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return Response.json({ error: "Password must contain at least one letter and one number." }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return Response.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { fullName, email: normalizedEmail, phone, password: hashed, batch },
  });

  await createSession(user.id);
  return Response.json({ user: { id: user.id, fullName: user.fullName, email: user.email } });
}
