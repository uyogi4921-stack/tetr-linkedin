import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [
    totalUsers,
    totalPosts,
    totalEvents,
    totalClubs,
    totalComments,
    totalMessages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.event.count(),
    prisma.club.count(),
    prisma.comment.count(),
    prisma.message.count(),
  ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      batch: true,
      isAdmin: true,
      isVerified: true,
      createdAt: true,
    },
  });

  const roleCounts = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  });

  const batchCounts = await prisma.user.groupBy({
    by: ["batch"],
    _count: { id: true },
  });

  const postTypeCounts = await prisma.post.groupBy({
    by: ["type"],
    _count: { id: true },
  });

  return Response.json({
    stats: {
      totalUsers,
      totalPosts,
      totalEvents,
      totalClubs,
      totalComments,
      totalMessages,
    },
    recentUsers,
    roleCounts: roleCounts.map((r) => ({ role: r.role, count: r._count.id })),
    batchCounts: batchCounts.map((b) => ({ batch: b.batch || "N/A", count: b._count.id })),
    postTypeCounts: postTypeCounts.map((p) => ({ type: p.type, count: p._count.id })),
  });
}
