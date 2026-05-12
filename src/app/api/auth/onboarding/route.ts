import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { expertise, experienceLevel, excitedField } = await request.json();

  const aboutParts: string[] = [];
  if (expertise) aboutParts.push(expertise);
  if (experienceLevel && experienceLevel !== "No experience") aboutParts.push(experienceLevel);
  if (excitedField) aboutParts.push(`Passionate about ${excitedField}`);
  const aboutLine = aboutParts.join(" | ");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      expertise,
      experienceLevel,
      excitedField,
      aboutLine,
      onboardingComplete: true,
    },
  });

  return Response.json({ user: updated });
}
