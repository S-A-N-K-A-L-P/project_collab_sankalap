/* eslint-disable @typescript-eslint/no-explicit-any -- Mongoose documents are runtime-shaped at this API boundary. */
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Proposal from "@/models/Proposal";
import Project from "@/models/Project";
import Task from "@/models/Task";

export async function GET(req: Request) {
  try {
    const session = getMobileSession(req);

    await dbConnect();
    const user = await User.findById(session.id).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Real counts for the profile screen (nothing estimated).
    const [proposals, projects, tasks] = await Promise.all([
      Proposal.countDocuments({ createdBy: session.id }),
      Project.countDocuments({ $or: [{ lead: session.id }, { members: session.id }] }),
      Task.find({ assignedTo: session.id }).select("status pullRequest.state").lean() as Promise<any[]>,
    ]);
    const done = (t: any) => t.status === "completed" || t.pullRequest?.state === "merged";
    const body = user.toObject();
    delete body.razorpayPaymentId;
    delete body.enrollmentNumber;
    return NextResponse.json({
      ...body,
      stats: {
        projects,
        proposals,
        followers: Array.isArray(body.followers) ? body.followers.length : 0,
        following: Array.isArray(body.following) ? body.following.length : 0,
        profileViews: body.profileViews ?? 0,
        tasksCompleted: tasks.filter(done).length,
        activeTasks: tasks.filter((t) => !done(t)).length,
        prsMerged: tasks.filter((t) => t.pullRequest?.state === "merged").length,
      },
    });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[PROFILE_GET_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
