import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Proposal from "@/models/Proposal";
import Project from "@/models/Project";
import Task from "@/models/Task";
import AdminShell from "@/app/admin/components/AdminShell";
import AdminDashboardClient from "@/app/admin/components/AdminDashboardClient";

export const metadata = { title: "Dashboard | Admin | Syncro" };

async function getStats() {
  await dbConnect();

  const [
    totalUsers, totalProposals, activeProposals, pendingProposals,
    totalProjects, activeProjects, totalTasks, completedTasks,
    adminCount, recentUsers, recentProposals,
  ] = await Promise.all([
    User.countDocuments(),
    Proposal.countDocuments(),
    Proposal.countDocuments({ status: "active" }),
    Proposal.countDocuments({ status: "proposal" }),
    Project.countDocuments(),
    Project.countDocuments({ status: "active" }),
    Task.countDocuments(),
    Task.countDocuments({ status: "completed" }),
    User.countDocuments({ role: { $in: ["sankalp_associate", "master_admin"] } }),
    User.find()
      .select("name email role universityName createdAt avatar")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Proposal.find()
      .populate("createdBy", "name avatar")
      .select("title status stage createdAt createdBy upvotes totalVotes")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  return {
    totalUsers, totalProposals, activeProposals, pendingProposals,
    totalProjects, activeProjects, totalTasks, completedTasks,
    adminCount,
    recentUsers: JSON.parse(JSON.stringify(recentUsers)),
    recentProposals: JSON.parse(JSON.stringify(recentProposals)),
  };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["sankalp_associate", "master_admin"].includes((session.user as any).role)) {
    redirect("/admin/login");
  }

  const stats = await getStats();

  return (
    <AdminShell>
      <AdminDashboardClient stats={stats} />
    </AdminShell>
  );
}
