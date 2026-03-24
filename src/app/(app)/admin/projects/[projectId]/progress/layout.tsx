import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

const TABS = [
    { label: "Dashboard", href: "" },
    { label: "Tasks", href: "/tasks" },
    { label: "Team", href: "/team" },
    { label: "Weekly Review", href: "/weekly-review" },
    { label: "Activity", href: "/activity" },
];

export default async function ProjectProgressLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ projectId: string }>;
}) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || (role !== "pixel_head" && role !== "project_lead" && role !== "pixel_member")) {
        redirect("/feed");
    }

    const { projectId } = await params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        redirect("/admin/projects");
    }

    await dbConnect();
    const project = await Project.findById(projectId).lean();

    if (!project) {
        redirect("/admin/projects");
    }

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-5">
                <p className="text-[11px] uppercase tracking-wider font-bold text-[#9ca3af]">Project Progress</p>
                <h1 className="text-2xl font-bold text-[#e5e7eb] mt-1">{(project as any).title}</h1>
                <p className="text-sm text-[#9ca3af] mt-1">Monitor tasks, activity, team load, and weekly reporting.</p>

                <div className="mt-4 flex flex-wrap gap-2">
                    {TABS.map((tab) => (
                        <Link
                            key={tab.label}
                            href={`/admin/projects/${projectId}/progress${tab.href}`}
                            className="rounded-lg border border-[#1f1f23] px-3 py-1.5 text-xs font-medium text-[#9ca3af] hover:text-[#e5e7eb] hover:border-[#2a2a2f]"
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>
            </div>

            {children}
        </div>
    );
}