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
import { TaskList } from "@/components/tracker/TaskComponents";
import { ContributorList } from "@/components/tracker/ContributorComponents";
import { VerificationPanel, ContributionLog } from "@/components/tracker/VerificationComponents";

export default function ProjectTrackerPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects?id=${id}`);
        // For demonstration, since we might not have a real project ID yet, we'll mock if it fails 404
        if (res.status === 404 || true) {
             setProject({
                _id: "demo_id",
                title: "Artsy v2 Framework Redesign",
                description: "Overhauling the core UI engine to support high-performance obsidian surfaces and dynamic network signaling across the collective layer.",
                status: "active",
                progress: 68,
                lead: { name: "Tushar G.", avatar: "" },
                orgId: { name: "Pixel Collective", slug: "pixel" },
                members: [1,2,3,4,5],
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
      <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/ideas" className="p-2.5 rounded-xl bg-[#121214] border border-[#1f1f23] text-[#9ca3af] hover:text-[#e5e7eb] hover:border-[#2a2a2f] transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col">
           <span className="text-[10px] font-mono font-bold text-[#1f1f23] uppercase tracking-widest">Tactical Layer / Tracking</span>
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
                   <ProjectProgressBar progress={project.progress} />
                   <ProjectMetaInfo project={project} />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      <ProjectTimeline activities={[
                        { title: "Kernel Initialized", time: "12:04 AM", description: "Base obsidian layer deployed to local nodes." },
                        { title: "Protocol Voted", time: "02:15 PM", description: "Governance threshold reached with 42 upvotes." },
                        { title: "Design Sprint", time: "05:30 PM", description: "High-fidelity mockups verified by collective." },
                      ]} />
                       <div className="bg-[#121214] border border-[#1f1f23] rounded-3xl p-8 space-y-4">
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1f1f23] font-mono">System Summary</h4>
                          <p className="text-[14px] text-[#9ca3af] leading-relaxed">
                             This project is currently in the <strong>TACTICAL SPRINT</strong> phase. All active nodes are reporting synchronized states.
                             Contribution velocity has increased by <strong>12%</strong> since the last epoch signal.
                          </p>
                          <div className="pt-4 flex flex-wrap gap-2">
                             {["NEXT.JS", "MONGODB", "FRAMER", "OBSIDIAN"].map(tag => (
                               <span key={tag} className="px-3 py-1.5 rounded-lg bg-[#17171a] border border-[#1f1f23] text-[10px] font-mono font-bold text-[#e5e7eb] uppercase tracking-widest">
                                 {tag}
                               </span>
                             ))}
                          </div>
                       </div>
                   </div>
                </div>
              )}

              {activeTab === "tasks" && (
                <TaskList 
                  tasks={[
                    { title: "Finalize Obsidian Surface Engine", assignee: "Tushar G.", dueDate: "Mar 24", priority: "high" },
                    { title: "Implement Node Telemetry", assignee: "Sarah C.", dueDate: "Mar 26", priority: "normal" },
                    { title: "Collective Governance Audit", assignee: "Marcus V.", dueDate: "Mar 28", priority: "normal" },
                    { title: "Vector Asset Optimization", assignee: "Tushar G.", dueDate: "Mar 30", completed: true },
                  ]} 
                  onAddTask={() => {}} 
                />
              )}

              {activeTab === "contributors" && (
                <ContributorList 
                  members={[
                    { name: "Tushar G.", role: "Lead Architect", reputation: 450, rank: 1, contributions: 24 },
                    { name: "Sarah C.", role: "Senior Developer", reputation: 320, rank: 5, contributions: 18 },
                    { name: "Marcus V.", role: "Security Auditor", reputation: 280, rank: 8, contributions: 12 },
                    { name: "Elena Q.", role: "UI Designer", reputation: 190, rank: 15, contributions: 9 },
                  ]} 
                />
              )}

              {activeTab === "activity" && (
                <div className="space-y-6">
                   <ContributionLog />
                   <div className="pt-8 border-t border-[#1f1f23]">
                      <ProjectTimeline activities={[
                        { title: "Commit: Node Alpha Updated", time: "1 hour ago", description: "Refactored the telemetry layer for reduced packet loss." },
                        { title: "Design Node Verification", time: "4 hours ago", description: "Design assets approved by Authority Head." },
                        { title: "Operational Log: Task Initialized", time: "Yesterday", description: "New task: Collective Governance Audit created by Marcus V." },
                      ]} />
                   </div>
                </div>
              )}

              {activeTab === "verification" && (
                <VerificationPanel 
                   contributions={[
                      { _id: "1", userId: { name: "Sarah C." }, type: "code", description: "Refactored Node Telemetry backend with advanced MongoDB aggregations for real-time tracking.", status: "pending" },
                      { _id: "2", userId: { name: "Marcus V." }, type: "security", description: "Internal governance audit of the Collective Layer completed. 3 minor signals detected and patched.", status: "pending" },
                   ]}
                   onVerify={(id, status) => console.log(id, status)}
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
           
           <div className="p-6 bg-[#6366f1]/5 border border-[#6366f1]/10 rounded-3xl space-y-4">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6366f1] font-mono">Verification Signal</h4>
              <p className="text-[12px] text-[#6366f1]/80 leading-relaxed font-medium">
                 This project requires final manual audit by the <strong>Collective Head</strong> before protocol release.
              </p>
              <button className="w-full py-3 rounded-2xl bg-[#6366f1] text-white font-bold text-[12px] uppercase tracking-widest hover:bg-[#4f46e5] transition-all">
                 Request Final Audit
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
