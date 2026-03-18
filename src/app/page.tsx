import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { HeroSection } from "@/components/portfolio/HeroSection";
import Link from "next/link";
import { ImpactCounters } from "@/components/portfolio/ImpactCounters";
import { ValuesGrid } from "@/components/portfolio/ValuesGrid";
import { CommunityPulse } from "@/components/portfolio/CommunityPulse";
import { ProjectShowcase } from "@/components/portfolio/ProjectShowcase";
import { VisionParallax } from "@/components/portfolio/VisionParallax";
import { MemberSpotlight } from "@/components/portfolio/MemberSpotlight";
import { PhilosophyTimeline } from "@/components/portfolio/PhilosophyTimeline";
import { InnovationBadge } from "@/components/portfolio/InnovationBadge";
import { OpenSourceManifesto } from "@/components/portfolio/OpenSourceManifesto";
import { SkillMosaic } from "@/components/portfolio/SkillMosaic";
import { GlobalReachMap } from "@/components/portfolio/GlobalReachMap";
import { CultureGallery } from "@/components/portfolio/CultureGallery";
import { TestimonialCarousel } from "@/components/portfolio/TestimonialCarousel";
import { FutureRoadmap } from "@/components/portfolio/FutureRoadmap";
import { EngagementCTA } from "@/components/portfolio/EngagementCTA";
import { IdeologyFooter } from "@/components/portfolio/IdeologyFooter";
import { IdeologyCloud } from "@/components/portfolio/IdeologyCloud";
import { DiversitySection } from "@/components/portfolio/DiversitySection";
import { Zap } from "lucide-react";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Proposal from "@/models/Proposal";
import Activity from "@/models/Activity";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/feed");
  }

  // Fetch real-time stats
  await dbConnect();
  const [userCount, proposalCount, activityCount] = await Promise.all([
    User.countDocuments(),
    Proposal.countDocuments(),
    Activity.countDocuments()
  ]);

  // Fetch featured projects
  const featuredProjects = await Proposal.find()
    .sort({ votes: -1 })
    .limit(3)
    .populate("createdBy", "name avatar")
    .lean();

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Syncro</span>
              <span className="text-[10px] font-mono font-black text-blue-600 uppercase tracking-widest">OS_INITIALIZER</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Online</span>
            </div>
            <Link href="/login" className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-500/20 hover:scale-105 transition-all active:scale-95">
              Initialize Sync
            </Link>
          </div>
        </div>
      </nav>
      <div className="pt-16">
        <HeroSection />
      </div>
      <ImpactCounters stats={[
        { label: "Active Builders", value: userCount, suffix: "+", color: "text-blue-500" },
        { label: "Live Proposals", value: proposalCount, suffix: "", color: "text-emerald-500" },
        { label: "Network Signals", value: activityCount, suffix: "+", color: "text-amber-500" },
      ]} />
      <IdeologyCloud />
      <ValuesGrid />
      <CommunityPulse />
      <ProjectShowcase projects={featuredProjects} />
      <VisionParallax />
      <MemberSpotlight />
      <PhilosophyTimeline />
      <InnovationBadge />
      <OpenSourceManifesto />
      <SkillMosaic />
      <GlobalReachMap />
      <CultureGallery />
      <DiversitySection />
      <TestimonialCarousel />
      <FutureRoadmap />
      <EngagementCTA userCount={userCount} />
      <IdeologyFooter />
    </main>
  );
}
