import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Proposal from "@/models/Proposal";
import Activity from "@/models/Activity";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeaturedProjects, FocusAreas, HowItWorks, JoinCta, LandingFooter, type FeaturedProject } from "@/components/landing/LandingSections";

export const metadata: Metadata = {
  title: "S.A.N.K.A.L.P. · Applied engineering community, powered by Morwin Technologies",
  description:
    "A self-guided community of Indian engineers building cloud, AI and IoT solutions for agriculture, healthcare and logistics. Powered by Morwin Technologies.",
};

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/feed");

  // Live community numbers and the most-supported proposals. The page still renders if the database is unreachable.
  let stats = { members: 0, projects: 0, contributions: 0 };
  let featured: FeaturedProject[] = [];
  try {
    await dbConnect();
    const [members, projects, contributions, top] = await Promise.all([
      User.countDocuments(),
      Proposal.countDocuments(),
      Activity.countDocuments(),
      Proposal.find({ createdBy: { $type: "objectId" }, status: { $nin: ["draft", "disabled", "rejected"] } })
        .sort({ upvotes: -1, createdAt: -1 })
        .limit(3)
        .select("title description type stage techStack createdBy")
        .populate("createdBy", "name")
        .lean(),
    ]);
    stats = { members, projects, contributions };
    featured = JSON.parse(JSON.stringify(top));
  } catch (e) {
    console.error("Landing page data unavailable", e);
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <LandingNav />
      <LandingHero
        stats={[
          { label: "Members", value: stats.members },
          { label: "Project proposals", value: stats.projects },
          { label: "Contributions", value: stats.contributions },
        ]}
      />
      <FocusAreas />
      <HowItWorks />
      <FeaturedProjects projects={featured} />
      <JoinCta />
      <LandingFooter />
    </main>
  );
}
