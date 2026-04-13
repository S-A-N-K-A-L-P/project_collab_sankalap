"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ProjectHeader, 
  ProjectProgressBar, 
  ProjectMetaInfo 
} from "@/components/tracker/CoreComponents";
import { 
  ProjectTimeline, 
  ProjectHealthIndicator, 
  ProjectOrgBadge, 
  ProjectLeadCard 
} from "@/components/tracker/SecondaryComponents";
import { TrackerTabs } from "@/components/tracker/TrackerTabs";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Core Functional Components
import { TaskList } from "@/components/tracker/TaskComponents";
import { ContributorList } from "@/components/tracker/ContributorComponents";
import { VerificationPanel } from "@/components/tracker/VerificationComponents";

// Advanced Tactical Components
import { KanbanBoard, WorkflowStages, AutomationRules, TaskHistory } from "@/components/tracker/advanced/KanbanBoard";
import { SkillMatrix, BandwidthTracker, TeamHeatmap, ReputationAllocation } from "@/components/tracker/advanced/ResourceManagement";
import { DeploymentPulse, BuildLogViewer, GitHubSyncCard, ActivityPulse } from "@/components/tracker/advanced/TelemetryComponents";
import { BurnDownChart, VelocityTracker, ComplexityIndicator } from "@/components/tracker/advanced/AnalyticsComponents";
import { SocialStats, TaskComments, NodeContextCard } from "@/components/tracker/advanced/SocialComponents";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects?id=${id}`);
        if (!res.ok) {
           // Fallback for demo if needed
           setProject({
                _id: id,
                title: "Project Sync Node",
                description: "Recovering synchronized state across distributed collective layers.",
                status: "active",
                progress: 100,
                lead: { name: "System Admin", avatar: "" },
                orgId: { name: "Pixel Collective", slug: "pixel" },
                members: [],
                createdAt: new Date(),
           });
           return;
        }
        const data = await res.json();
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 px-4">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/ideas" className="p-2.5 rounded-xl bg-[#121214] border border-[#1f1f23] text-[#9ca3af] hover:text-[#e5e7eb] hover:border-[#2a2a2f] transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col">
           <span className="text-[10px] font-mono font-bold text-[#1f1f23] uppercase tracking-widest">Tactical Layer / Node Specs</span>
           <span className="text-[13px] font-bold text-[#e5e7eb] tracking-tight">Deployment Node {id?.toString().slice(-6) || "INITIAL"}</span>
        </div>
      </div>

      {/* Main Header */}
      <ProjectHeader project={project} />

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <TrackerTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {activeTab === "overview" && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <ProjectProgressBar progress={project.progress} />
                      <SocialStats />
                   </div>
                   <ProjectMetaInfo project={project} />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      <ProjectTimeline activities={[]} />
                       <div className="space-y-8">
                          <ComplexityIndicator score={84} />
                       </div>
                   </div>
                </div>
              )}

              {activeTab === "tasks" && (
                <div className="space-y-12">
                   <KanbanBoard columns={[]} />
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-12">
                    <ActivityPulse />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Sidebar Stats */}
        <div className="lg:col-span-4 space-y-6">
           <ProjectOrgBadge org={project.orgId} />
           <ProjectLeadCard lead={project.lead} />
           <ProjectHealthIndicator />
        </div>

      </div>
    </div>
  );
}
