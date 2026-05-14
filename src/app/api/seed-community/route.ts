import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST() {
  const user = await getSession();
  if (!user || !user.isAdmin) {
    return Response.json({ error: "Admin only" }, { status: 403 });
  }

  const results: string[] = [];

  // Seed Resources
  const resources = [
    {
      title: "TETR Brochure 2025",
      description: "Official TETR College of Business brochure with programs, campus, and admissions information.",
      fileUrl: "/resources/tetr-brochure-2025.pdf",
      type: "Guide",
    },
    {
      title: "Dropshipping + D2C Report",
      description: "Comprehensive report on Dropshipping and Direct-to-Consumer business models, strategies, and market analysis.",
      fileUrl: "/resources/dropshipping-d2c-report.pdf",
      type: "Guide",
    },
    {
      title: "Faculty Handbook",
      description: "TETR College of Business faculty handbook with academic policies, guidelines, and procedures.",
      fileUrl: "/resources/faculty-handbook.pdf",
      type: "Guide",
    },
    {
      title: "D2C Report 2025",
      description: "Comprehensive Direct-to-Consumer industry report with market trends, strategies, and case studies.",
      fileUrl: "/resources/d2c-report-2025.pdf",
      type: "Guide",
    },
    {
      title: "Career Labs 2025-26",
      description: "TETR Career Labs program details for 2025-26 with career development workshops, mentorship, and placement support.",
      fileUrl: "/resources/career-labs-2025-26.pdf",
      type: "Guide",
    },
  ];

  for (const r of resources) {
    const existing = await prisma.resource.findFirst({ where: { title: r.title } });
    if (!existing) {
      await prisma.resource.create({ data: r });
      results.push(`Created resource: ${r.title}`);
    } else {
      results.push(`Skipped (exists): ${r.title}`);
    }
  }

  // Seed Clubs
  const clubs = [
    {
      name: "Arts & Crafts Club",
      description: "For art, DIY projects, digital art, crafts, creative challenges, and sharing projects.",
    },
    {
      name: "Debating Club",
      description: "Debates, courtroom battles, negotiations, crisis simulations, ethical discussions, and strategy-based challenges. Run by Shradhani and Sahasra.",
    },
    {
      name: "German Language Club",
      description: "Learn and practice German language skills with fellow TETR students.",
    },
    {
      name: "Spanish Language Club",
      description: "Learn and practice Spanish language skills with fellow TETR students.",
    },
    {
      name: "Hindi Language Club",
      description: "Learn and practice Hindi language skills with fellow TETR students.",
    },
  ];

  for (const c of clubs) {
    const existing = await prisma.club.findFirst({ where: { name: c.name } });
    if (!existing) {
      await prisma.club.create({ data: c });
      results.push(`Created club: ${c.name}`);
    } else {
      results.push(`Skipped (exists): ${c.name}`);
    }
  }

  return Response.json({ results });
}
