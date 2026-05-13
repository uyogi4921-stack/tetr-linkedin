import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/auth";

export async function GET() {
  const user = await getSessionId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const count = await prisma.message.count({
    where: {
      receiverId: user.id,
      isRead: false,
    },
  });

  return Response.json({ count });
}
