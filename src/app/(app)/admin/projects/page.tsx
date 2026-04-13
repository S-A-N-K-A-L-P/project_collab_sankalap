import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

export default async function AdminProjectsPage() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || (role !== "pixel_head" && role !== "project_lead")) {
        redirect("/feed");
    }

    await dbConnect();
    const rawProjects = await Project.find({}).sort({ updatedAt: -1 }).lean();
    const projects = JSON.parse(JSON.stringify(rawProjects));

    return (
        <div className="space-y-6">
            <div className="bg-surface p-6 rounded-2xl border border-border-subtle">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Progress Hub</h1>
                <p className="text-muted text-sm mt-1">Select a project to open the progress tracker.</p>
            </div>

            {projects.length === 0 ? (
                <div className="rounded-2xl border border-border-subtle bg-surface p-8 text-sm text-muted">
                    No projects found yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {projects.map((project: any) => (
                        <Link
                            key={project._id}
                            href={`/admin/projects/${project._id}/progress`}
                            className="rounded-2xl border border-border-subtle bg-surface p-4 hover:border-border-strong transition-colors"
                        >
                            <p className="text-foreground font-semibold">{project.title}</p>
                            <p className="text-xs text-muted mt-1 line-clamp-2">{project.description || "No description provided."}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}