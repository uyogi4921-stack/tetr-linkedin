import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding community data...");

  // Seed Resources (TETR reports/PDFs)
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
  ];

  for (const r of resources) {
    const existing = await prisma.resource.findFirst({ where: { title: r.title } });
    if (!existing) {
      await prisma.resource.create({ data: r });
      console.log(`  Created resource: ${r.title}`);
    } else {
      console.log(`  Skipped (exists): ${r.title}`);
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
      console.log(`  Created club: ${c.name}`);
    } else {
      console.log(`  Skipped (exists): ${c.name}`);
    }
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
