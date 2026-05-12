import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 12);

  // Create batches
  const batch2028 = await prisma.batch.create({
    data: { name: "2028", year: 2028, description: "4-year Learn by Doing Management & Technology program" },
  });
  const batch2029 = await prisma.batch.create({
    data: { name: "2029", year: 2029, description: "4-year Learn by Doing Management & Technology program" },
  });
  const batch2030 = await prisma.batch.create({
    data: { name: "2030", year: 2030, description: "4-year Learn by Doing Management & Technology program" },
  });

  // Create users
  const alex = await prisma.user.create({
    data: {
      fullName: "Alex Chen",
      email: "alex@tetr.edu",
      password,
      batch: "2030",
      role: "student",
      expertise: "Financial modeling, Python, Data Analysis",
      experienceLevel: "Intern",
      excitedField: "Finance",
      aboutLine: "Finance Major | Aspiring Consultant",
      isVerified: true,
      onboardingComplete: true,
    },
  });

  const anya = await prisma.user.create({
    data: {
      fullName: "Anya Sharma",
      email: "anya@tetr.edu",
      password,
      batch: "2029",
      role: "student",
      expertise: "Strategy consulting, Case analysis, Market research",
      experienceLevel: "Intern",
      excitedField: "Consulting",
      aboutLine: "MBA Candidate at TETR | Ex-Deloitte",
      isVerified: true,
      onboardingComplete: true,
    },
  });

  const david = await prisma.user.create({
    data: {
      fullName: "David Chen",
      email: "david@tetr.edu",
      password,
      batch: "2028",
      role: "alumnus",
      expertise: "Product management, Go-to-market strategy, SaaS",
      experienceLevel: "Full-time professional",
      excitedField: "Product Management",
      aboutLine: "Product Manager at Google | Alumni '20",
      isVerified: true,
      onboardingComplete: true,
    },
  });

  const sarah = await prisma.user.create({
    data: {
      fullName: "Sarah Jenkins",
      email: "sarah@tetr.edu",
      password,
      batch: "2030",
      role: "student",
      expertise: "Investment analysis, Venture capital, Startups",
      experienceLevel: "Intern",
      excitedField: "Finance",
      aboutLine: "Investments Associate | Batch 2030",
      isVerified: true,
      onboardingComplete: true,
    },
  });

  const elias = await prisma.user.create({
    data: {
      fullName: "Dr. Elias Thorne",
      email: "elias@tetr.edu",
      password,
      batch: null,
      role: "faculty",
      expertise: "Fintech, Digital banking, Blockchain",
      experienceLevel: "Faculty / Mentor",
      excitedField: "Finance",
      aboutLine: "Professor of Fintech",
      isVerified: true,
      isAdmin: true,
      onboardingComplete: true,
    },
  });

  const maria = await prisma.user.create({
    data: {
      fullName: "Prof. Maria Rodriguez",
      email: "maria@tetr.edu",
      password,
      batch: null,
      role: "faculty",
      expertise: "Career development, Networking, Alumni relations",
      experienceLevel: "Faculty / Mentor",
      excitedField: "Education",
      aboutLine: "Career Services | Tetr College",
      isVerified: true,
      isAdmin: true,
      onboardingComplete: true,
    },
  });

  const mark = await prisma.user.create({
    data: {
      fullName: "Mark Lee",
      email: "mark@tetr.edu",
      password,
      batch: null,
      role: "faculty",
      expertise: "Student affairs, Career services",
      experienceLevel: "Full-time professional",
      excitedField: "Education",
      aboutLine: "Staff, Career Services",
      isVerified: true,
      onboardingComplete: true,
    },
  });

  const emily = await prisma.user.create({
    data: {
      fullName: "Emily Davis",
      email: "emily@tetr.edu",
      password,
      batch: "2028",
      role: "student",
      expertise: "Marketing analytics, Brand strategy, Social media",
      experienceLevel: "Project-based",
      excitedField: "Marketing",
      aboutLine: "Student, Batch 2028 | Marketing Enthusiast",
      isVerified: true,
      onboardingComplete: true,
    },
  });

  const raj = await prisma.user.create({
    data: {
      fullName: "Raj Patel",
      email: "raj@tetr.edu",
      password,
      batch: "2030",
      role: "student",
      expertise: "Full-stack development, AI/ML, Cloud computing",
      experienceLevel: "Startup founder",
      excitedField: "Technology",
      aboutLine: "Tech Founder | Batch 2030",
      isVerified: true,
      onboardingComplete: true,
    },
  });

  const priya = await prisma.user.create({
    data: {
      fullName: "Priya Mehta",
      email: "priya@tetr.edu",
      password,
      batch: "2029",
      role: "student",
      expertise: "Sustainability, ESG analysis, Impact investing",
      experienceLevel: "Intern",
      excitedField: "Sustainability",
      aboutLine: "Sustainability advocate | Batch 2029",
      isVerified: true,
      onboardingComplete: true,
    },
  });

  // Create clubs
  const consultingClub = await prisma.club.create({
    data: {
      name: "Consulting Society",
      description: "Practice case studies, network with industry professionals, and prepare for consulting careers.",
    },
  });

  const techClub = await prisma.club.create({
    data: {
      name: "Tech Club",
      description: "Explore technology trends, build projects, and connect with tech professionals.",
    },
  });

  const financeClub = await prisma.club.create({
    data: {
      name: "Finance Club",
      description: "Investment banking workshops, VC seminars, and financial modeling practice.",
    },
  });

  const sustainabilityClub = await prisma.club.create({
    data: {
      name: "Sustainability Circle",
      description: "Discuss ESG, impact investing, and sustainable business practices.",
    },
  });

  const caseCompClub = await prisma.club.create({
    data: {
      name: "Case Competition Community",
      description: "Team up for national and global case competitions. Share prep resources and winning strategies.",
    },
  });

  const tetrTakeovers = await prisma.club.create({
    data: {
      name: "Tetr Takeovers Volunteers",
      description: "Organize and participate in Tetr Takeover city events for prospective students.",
    },
  });

  // Add members to clubs
  const memberships = [
    { userId: alex.id, clubId: financeClub.id },
    { userId: alex.id, clubId: consultingClub.id },
    { userId: anya.id, clubId: consultingClub.id, role: "lead" },
    { userId: anya.id, clubId: caseCompClub.id },
    { userId: david.id, clubId: techClub.id },
    { userId: sarah.id, clubId: financeClub.id, role: "lead" },
    { userId: sarah.id, clubId: caseCompClub.id },
    { userId: raj.id, clubId: techClub.id, role: "lead" },
    { userId: raj.id, clubId: caseCompClub.id },
    { userId: emily.id, clubId: tetrTakeovers.id },
    { userId: emily.id, clubId: consultingClub.id },
    { userId: priya.id, clubId: sustainabilityClub.id, role: "lead" },
    { userId: priya.id, clubId: financeClub.id },
  ];

  for (const m of memberships) {
    await prisma.clubMember.create({ data: m });
  }

  // Create posts
  await prisma.post.create({
    data: {
      title: "Batch 2028 Orientation: Welcome to the TETR Community!",
      body: "TETR needs students building in a state campus in an institution to connect, build, and grow together. Welcome to the professional networking platform for our community. Share your experiences, find opportunities, and make lasting professional connections. Looking forward to an amazing journey together!",
      type: "Event announcement",
      authorId: elias.id,
      isPinned: true,
    },
  });

  await prisma.post.create({
    data: {
      title: "First Year Project Showcase Winners Announced",
      body: "Congratulations to our team for taking first place! The judges were impressed by the innovative approach to solving real-world business problems. Special thanks to all participants who made this showcase a success. #TETRProud",
      type: "General",
      authorId: anya.id,
    },
  });

  await prisma.post.create({
    data: {
      title: "Networking Mixer with Alumni and Staff: Batch 2030 Invited",
      body: "The future of supply chain alerts to acrovale a market grain, key trends for 2025. Join us for an evening of meaningful conversations with TETR alumni working in consulting, finance, and tech. Light refreshments will be served.",
      type: "Event announcement",
      authorId: maria.id,
    },
  });

  await prisma.post.create({
    data: {
      body: "Just finished my summer internship at McKinsey! Happy to share my experience and tips for consulting recruiting. DM me if you want to chat about case prep or the interview process.",
      type: "Reflection",
      authorId: anya.id,
    },
  });

  await prisma.post.create({
    data: {
      title: "Looking for teammates for the Global Case Competition",
      body: "Our team needs one more member with strong quantitative skills for the upcoming Global Innovation Sprint. We're focusing on fintech solutions for emerging markets. If you're passionate about finance and tech, let's connect!",
      type: "Help me",
      authorId: sarah.id,
      clubId: caseCompClub.id,
    },
  });

  await prisma.post.create({
    data: {
      title: "New AI/ML Study Group Starting Next Week",
      body: "Starting a weekly study group focused on practical AI applications in business. We'll cover everything from basic Python to building ML models for business analytics. All skill levels welcome! First session: Tuesday 6PM in the Innovation Lab.",
      type: "Opportunity",
      authorId: raj.id,
      clubId: techClub.id,
    },
  });

  await prisma.post.create({
    data: {
      body: "Great session today on ESG metrics and reporting standards. Thanks to everyone who attended! Slides have been uploaded to our Resources page. Next week we'll dive into impact investing frameworks.",
      type: "General",
      authorId: priya.id,
      clubId: sustainabilityClub.id,
    },
  });

  await prisma.post.create({
    data: {
      title: "Summer Internship Openings at Goldman Sachs",
      body: "Goldman Sachs is actively recruiting at TETR. They have openings in Investment Banking, Asset Management, and Technology divisions. Application deadline is November 30. Check the Resources page for the company list and application links.",
      type: "Opportunity",
      authorId: mark.id,
    },
  });

  // Create events
  const now = new Date();
  const futureDate = (daysAhead: number) => new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const pastDate = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  await prisma.event.create({
    data: {
      title: "Investment Banking Workshop",
      description: "Deep dive into financial modeling, valuation techniques, and investment banking careers. Led by alumni from JP Morgan and Morgan Stanley.",
      startTime: futureDate(5),
      endTime: futureDate(5),
      location: "Room 301, Main Campus",
      type: "Workshop",
      clubId: financeClub.id,
    },
  });

  await prisma.event.create({
    data: {
      title: "AI in Business Night Workshop",
      description: "Explore how AI is transforming consulting, finance, and marketing. Hands-on demos and case studies.",
      startTime: futureDate(12),
      endTime: futureDate(12),
      isOnline: true,
      type: "Workshop",
      clubId: techClub.id,
    },
  });

  await prisma.event.create({
    data: {
      title: "VC Funding Seminar",
      description: "Learn about venture capital, angel investing, and how to pitch your startup idea. Featuring guest speakers from Sequoia and Lightspeed.",
      startTime: futureDate(20),
      location: "Auditorium B",
      type: "Guest lecture",
      clubId: financeClub.id,
    },
  });

  await prisma.event.create({
    data: {
      title: "Case Interview Prep",
      description: "Practice case interviews with peers and alumni mentors. Get feedback on your framework, math, and communication skills.",
      startTime: futureDate(8),
      endTime: futureDate(8),
      location: "Room 205, Business Block",
      type: "Workshop",
      clubId: consultingClub.id,
    },
  });

  await prisma.event.create({
    data: {
      title: "Tetr Takeover: Mumbai",
      description: "Host prospective students in Mumbai. Share your Tetr experience and help build the next generation of business leaders. Travel reimbursement available for student hosts.",
      startTime: futureDate(30),
      location: "Mumbai, India",
      type: "Tetr Takeover",
      clubId: tetrTakeovers.id,
    },
  });

  await prisma.event.create({
    data: {
      title: "Global Innovation Sprint",
      description: "48-hour case competition. Teams tackle real business challenges from partner companies. Cash prizes and internship opportunities for top teams.",
      startTime: futureDate(45),
      endTime: futureDate(47),
      isOnline: true,
      type: "Case competition",
      clubId: caseCompClub.id,
    },
  });

  // Past events
  await prisma.event.create({
    data: {
      title: "Digital Strategy Hackathon",
      description: "24-hour hackathon on digital transformation strategies for traditional industries.",
      startTime: pastDate(30),
      endTime: pastDate(29),
      type: "Case competition",
    },
  });

  await prisma.event.create({
    data: {
      title: "AI in Business Workshop (Past)",
      description: "Exploring practical AI applications in business decision-making.",
      startTime: pastDate(15),
      type: "Workshop",
      clubId: techClub.id,
    },
  });

  // Create resources
  await prisma.resource.create({
    data: {
      title: "Case Interview Framework Guide",
      description: "Comprehensive guide covering all major case frameworks: profitability, market entry, M&A, pricing, and more.",
      type: "Guide",
      fileUrl: "#",
      clubId: consultingClub.id,
    },
  });

  await prisma.resource.create({
    data: {
      title: "Financial Modeling Template Pack",
      description: "Excel templates for DCF, LBO, and comparable company analysis. Industry-standard formatting.",
      type: "Template",
      fileUrl: "#",
      clubId: financeClub.id,
    },
  });

  await prisma.resource.create({
    data: {
      title: "Top 100 Companies Hiring at TETR",
      description: "Updated list of companies actively recruiting Tetr students, with contacts and application links.",
      type: "Company list",
      fileUrl: "#",
    },
  });

  await prisma.resource.create({
    data: {
      title: "Tetr Disrupt 2025 Winner Deck",
      description: "Winning presentation from last year's Tetr Disrupt competition on sustainable fintech solutions.",
      type: "Competition deck",
      fileUrl: "#",
      clubId: caseCompClub.id,
    },
  });

  await prisma.resource.create({
    data: {
      title: "Startup Pitch Deck Template",
      description: "Professional pitch deck template used by YC-backed founders. Includes storytelling structure and financial slide templates.",
      type: "Template",
      fileUrl: "#",
    },
  });

  await prisma.resource.create({
    data: {
      title: "ESG Reporting Standards Overview",
      description: "Video walkthrough of global ESG reporting frameworks including GRI, SASB, and TCFD.",
      type: "Video",
      fileUrl: "#",
      clubId: sustainabilityClub.id,
    },
  });

  await prisma.resource.create({
    data: {
      title: "Python for Business Analytics",
      description: "Beginner-friendly guide to Python programming for business data analysis and visualization.",
      type: "Guide",
      fileUrl: "#",
      clubId: techClub.id,
    },
  });

  // Create rules
  const rules = [
    "All posts must respect the real-name policy. No fake or anonymous names.",
    "No spam, advertisements, or self-promotional links unrelated to Tetr.",
    "No political, religious, or offensive content.",
    "No harassment, bullying, or intimidation of any kind.",
    "Keep discussions professional and career-focused.",
    "Respect intellectual property. Always credit original sources.",
  ];

  for (const text of rules) {
    await prisma.rule.create({ data: { text } });
  }

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: alex.id,
      type: "announcement",
      title: "Welcome to TETR!",
      message: "Your account has been verified. Start connecting with your batch-mates.",
      link: "/feed",
    },
  });

  await prisma.notification.create({
    data: {
      userId: alex.id,
      type: "event",
      title: "Upcoming: Investment Banking Workshop",
      message: "Don't miss the IB workshop this weekend. Register now!",
      link: "/events",
    },
  });

  await prisma.notification.create({
    data: {
      userId: alex.id,
      type: "comment",
      title: "Anya Sharma commented on a post",
      message: "Great insight! Would love to discuss this further.",
      link: "/feed",
    },
  });

  // Create some messages
  await prisma.message.create({
    data: { senderId: anya.id, receiverId: alex.id, text: "Hey Alex! Are you interested in joining the case competition team?" },
  });
  await prisma.message.create({
    data: { senderId: alex.id, receiverId: anya.id, text: "Absolutely! I've been working on my case prep. When's the next meeting?" },
  });
  await prisma.message.create({
    data: { senderId: anya.id, receiverId: alex.id, text: "This Thursday at 5 PM in Room 205. Looking forward to it!" },
  });
  await prisma.message.create({
    data: { senderId: david.id, receiverId: alex.id, text: "Hi Alex, I saw your post about financial modeling. Happy to mentor you if you're interested." },
  });

  // Add some likes to posts
  const allPosts = await prisma.post.findMany();
  const allUsers = [alex, anya, david, sarah, elias, maria, raj, emily, priya];

  for (const post of allPosts.slice(0, 4)) {
    for (const u of allUsers.slice(0, 5)) {
      if (u.id !== post.authorId) {
        await prisma.postLike.create({ data: { userId: u.id, postId: post.id } }).catch(() => {});
      }
    }
  }

  // Add some comments
  await prisma.comment.create({
    data: { text: "This is exactly what our batch needed. Thanks for organizing!", authorId: sarah.id, postId: allPosts[0].id },
  });
  await prisma.comment.create({
    data: { text: "Looking forward to connecting with everyone!", authorId: raj.id, postId: allPosts[0].id },
  });
  await prisma.comment.create({
    data: { text: "Congratulations to the winners! Incredible work on the project showcase.", authorId: elias.id, postId: allPosts[1].id },
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
