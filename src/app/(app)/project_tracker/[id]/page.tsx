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

export default function ProjectTrackerPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects?id=${id}`);
        // Mocking for demonstration if project not found
        if (res.status === 404 || true) {
          setProject({
            _id: "demo_id",
            title: "Artsy v2 Framework Redesign",
            description: "Overhauling the core UI engine to support high-performance rendering layers and dynamic synchronization across key modules.",
            status: "active",
            progress: 68,
            lead: { name: "Tushar Yadav", avatar: "" },
            orgId: { name: "Pixel Collective", slug: "pixel" },
            members: [1, 2, 3, 4, 5],
            createdAt: new Date(),
          });
        } else {
          const data = await res.json();
          setProject(data);
        }
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
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-350 mx-auto space-y-8 pb-20">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/ideas" className="p-2.5 rounded-xl bg-surface border border-border-subtle text-muted hover:text-foreground hover:border-border-strong transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Project Workspace / Tracking</span>
          <span className="text-[13px] font-bold text-foreground tracking-tight">Workspace Instance #{id?.toString().slice(-6) || "INITIAL"}</span>
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
                    <ProjectTimeline activities={[
                      { title: "Project Initialized", time: "12:04 AM", description: "Base architecture setup completed on central repository." },
                      { title: "Proposal Approved", time: "02:15 PM", description: "Project approval threshold reached with positive community feedback." },
                      { title: "Design Phase Completed", time: "05:30 PM", description: "High-fidelity interface mockups approved by design leads." },
                    ]} />
                    <div className="space-y-8">
                      <ComplexityIndicator score={84} />
                      <div className="bg-surface border border-border-subtle rounded-xl p-6 space-y-4 shadow-none">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted font-mono">Project Summary</h4>
                        <p className="text-[13px] text-muted leading-relaxed">
                          This project is currently in the active development phase. All task blocks are on schedule and progress is being regularly synchronized.
                        </p>
                        <div className="pt-3 flex flex-wrap gap-1.5">
                          {["NEXT.JS", "MONGODB", "FRAMER", "REACT", "TAILWIND"].map(tag => (
                            <span key={tag} className="px-2.5 py-1 rounded-md bg-surface-alt border border-border-subtle text-[9px] font-mono font-bold text-foreground uppercase tracking-widest">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2"><BurnDownChart /></div>
                    <VelocityTracker />
                  </div>
                </div>
              )}

              {activeTab === "tasks" && (
                <div className="space-y-12">
                  <WorkflowStages stages={[
                    { label: "Design", status: "completed" },
                    { label: "Specification", status: "completed" },
                    { label: "Development", status: "active" },
                    { label: "UAT Testing", status: "pending" },
                    { label: "Production", status: "pending" },
                  ]} />

                  <div className="pt-4 border-t border-border-subtle">
                    <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter mb-8">Active Work Board</h3>
                    <KanbanBoard columns={[
                      {
                        id: "pending", title: "Backlog", status: "pending", accent: "var(--muted-foreground)", tasks: [
                          { _id: "1", title: "Refactor API Gateway", description: "Improve modularity of NLP querying router.", priority: "high", status: "pending", progress: 0, deadline: "2026-06-15", assignedTo: "sarah" },
                          { _id: "2", title: "Vector Asset Polish", description: "Optimize SVG assets size and layout grids.", priority: "low", status: "pending", progress: 0, deadline: "2026-06-20", assignedTo: "sarah" },
                        ]
                      },
                      {
                        id: "in-progress", title: "In Progress", status: "in-progress", accent: "var(--primary)", tasks: [
                          { _id: "3", title: "Core Query Translation Engine", description: "Establish structured query translations for NLP model.", priority: "high", status: "in-progress", progress: 50, deadline: "2026-06-10", assignedTo: "tushar" },
                        ]
                      },
                      {
                        id: "completed", title: "Completed", status: "completed", accent: "var(--success)", tasks: [
                          { _id: "4", title: "Establish MongoDB Cluster", description: "Perform schema definition and DB configuration.", priority: "medium", status: "completed", progress: 100, deadline: "2026-05-24", assignedTo: "marcus" },
                        ]
                      },
                    ]} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AutomationRules rules={[
                      { trigger: "Task Approved", event: "Status -> Completed", action: "Contributions +10" },
                      { trigger: "PR Merged", event: "Main Repository Branch", action: "Update Progress" },
                    ]} />
                    <TaskHistory logs={[
                      { user: "Tushar Yadav", action: "moved 'Core Query Translation Engine' to In Progress", time: "1h ago" },
                      { user: "Sarah C.", action: "created task 'Refactor API Gateway'", time: "4h ago" },
                    ]} />
                  </div>
                </div>
              )}

              {activeTab === "contributors" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SkillMatrix skills={[
                      { name: "React / Next", value: 98 },
                      { name: "Backend APIs", value: 74 },
                      { name: "User Experience", value: 82 },
                      { name: "Security Standards", value: 65 },
                      { name: "Database Logic", value: 91 },
                    ]} />
                    <div className="space-y-8">
                      <NodeContextCard user={project.lead} />
                      <ReputationAllocation />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2"><BandwidthTracker team={[
                      { name: "Tushar Yadav", load: 85 },
                      { name: "Sarah C.", load: 45 },
                      { name: "Marcus V.", load: 30 },
                    ]} /></div>
                    <TeamHeatmap />
                  </div>
                  <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter pt-8 border-t border-border">Project Team</h3>
                  <ContributorList
                    members={[
                      { name: "Tushar Yadav", role: "Lead Architect", reputation: 450, rank: 1, contributions: 24 },
                      { name: "Sarah C.", role: "Senior Developer", reputation: 320, rank: 5, contributions: 18 },
                      { name: "Marcus V.", role: "Security Auditor", reputation: 280, rank: 8, contributions: 12 },
                    ]}
                  />
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <DeploymentPulse project={project} />
                      <BuildLogViewer />
                    </div>
                    <div className="space-y-8">
                      <GitHubSyncCard repo={{ repoName: "artsy-v2-core", owner: "pixel-collective", syncStatus: "syncing", defaultBranch: "main" }} />
                      <ActivityPulse />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border">
                    <TaskComments />
                  </div>
                </div>
              )}

              {activeTab === "verification" && (
                <VerificationPanel
                  contributions={[
                    { _id: "1", userId: { name: "Sarah C." }, type: "code", description: "Refactored API Gateway query backend with advanced MongoDB aggregations for real-time tracking.", status: "pending" },
                    { _id: "2", userId: { name: "Marcus V." }, type: "security", description: "Internal security audit of the API gateway endpoints completed. 3 minor alerts verified and patched.", status: "pending" },
                  ]}
                  onVerify={async (id, status) => {
                    try {
                      const res = await fetch("/api/contributions", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id, status })
                      });
                      if (res.ok) {
                        // Refresh project data to see progress updates
                        window.location.reload();
                      }
                    } catch (err) {
                      console.error("Verification failed", err);
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Sidebar Stats */}
        <div className="lg:col-span-4 space-y-6">
          <ProjectOrgBadge org={project.orgId} />
          <ProjectLeadCard lead={project.lead} />
          <ProjectHealthIndicator />

          <div className="p-5 bg-accent/5 border border-accent/20 border-l-4 border-l-accent rounded-xl space-y-3.5 shadow-none">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent font-mono">Review Milestone</h4>
            <p className="text-[12px] text-accent/80 leading-relaxed font-medium">
              This project requires final manual review by the <strong>Project Master</strong> before production release.
            </p>
            <button className="w-full py-2.5 rounded-lg bg-accent text-white font-bold text-[11px] uppercase tracking-widest hover:bg-accent/90 transition-all">
              Request Final Review
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
