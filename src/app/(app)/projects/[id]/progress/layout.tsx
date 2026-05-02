import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
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
    params: Promise<{ id: string }>;
}) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || (role !== "pixel_head" && role !== "project_lead" && role !== "pixel_member")) {
        redirect("/feed");
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        redirect("/feed");
    }

    await dbConnect();
    const project = await Project.findById(id).lean();

    if (!project) {
        redirect("/feed");
    }

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-border-subtle bg-surface p-5">
                <p className="text-[11px] uppercase tracking-wider font-bold text-muted">Project Progress</p>
                <h1 className="text-2xl font-bold text-foreground mt-1">{(project as any).title}</h1>
                <p className="text-sm text-muted mt-1">Monitor tasks, activity, team load, and weekly reporting.</p>

                <div className="mt-4 flex flex-wrap gap-2">
                    {TABS.map((tab) => (
                        <Link
                            key={tab.label}
                            href={`/projects/${id}/progress${tab.href}`}
                            className="rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:border-border-strong"
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
