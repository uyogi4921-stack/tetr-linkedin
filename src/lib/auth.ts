import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

const SESSION_COOKIE = "tetr_session";

export async function createSession(userId: string) {
  const token = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${userId}:${token}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return token;
}

/**
 * Fast auth check — only parses cookie, no DB query.
 * Returns { id } or null. Use this in API routes that only need userId.
 */
export async function getSessionId(): Promise<{ id: string } | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return null;
  const [userId] = session.value.split(":");
  if (!userId) return null;
  return { id: userId };
}

/**
 * Full auth check — parses cookie + queries DB for user profile.
 * Use in /api/auth/me or when you need full user data.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return null;

  const [userId] = session.value.split(":");
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
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
      phone: true,
      isAdmin: true,
      onboardingComplete: true,
      experienceLevel: true,
    },
  });

  return user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
