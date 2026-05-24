import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Proposal from "@/models/Proposal";
import AdminShell from "@/app/admin/components/AdminShell";
import AdminStatCard from "@/app/admin/components/AdminStatCard";
import { Users, FileText, Activity, ShieldCheck } from "lucide-react";

export const metadata = { title: "Dashboard | Admin | Pixel Platform" };

async function getStats() {
  await dbConnect();

  const [totalUsers, totalProposals, activeProposals, adminCount, recentUsers, recentProposals] =
    await Promise.all([
      User.countDocuments(),
      Proposal.countDocuments(),
      Proposal.countDocuments({ status: "active" }),
      User.countDocuments({ role: { $in: ["admin", "pixel_head"] } }),
      User.find()
        .select("name email role universityName createdAt")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Proposal.find()
        .populate("createdBy", "name")
        .select("title status stage createdAt createdBy")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

  return { totalUsers, totalProposals, activeProposals, adminCount, recentUsers, recentProposals };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["admin", "pixel_head"].includes((session.user as any).role)) {
    redirect("/admin/login");
  }

  const { totalUsers, totalProposals, activeProposals, adminCount, recentUsers, recentProposals } =
    await getStats();

  return (
    <AdminShell>
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <AdminStatCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            description="Registered nodes"
          />
          <AdminStatCard
            title="Total Proposals"
            value={totalProposals}
            icon={FileText}
            description="All time"
          />
          <AdminStatCard
            title="Active Proposals"
            value={activeProposals}
            icon={Activity}
            description="Currently active"
            accent
          />
          <AdminStatCard
            title="Admin Accounts"
            value={adminCount}
            icon={ShieldCheck}
            description="Admins & pixel heads"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle">
              <h2 className="text-[12px] font-mono font-bold text-muted uppercase tracking-widest">
                Recent Users
              </h2>
            </div>
            <div className="divide-y divide-border-subtle">
              {(recentUsers as any[]).map((user) => (
                <div
                  key={user._id.toString()}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-muted font-mono truncate">
                      {user.email}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-accent/10 text-accent">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle">
              <h2 className="text-[12px] font-mono font-bold text-muted uppercase tracking-widest">
                Recent Proposals
              </h2>
            </div>
            <div className="divide-y divide-border-subtle">
              {(recentProposals as any[]).map((proposal) => (
                <div
                  key={proposal._id.toString()}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-foreground line-clamp-1">
                      {proposal.title}
                    </p>
                    <p className="text-[11px] text-muted font-mono">
                      by {proposal.createdBy?.name ?? "Unknown"}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                      proposal.status === "active"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {proposal.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
