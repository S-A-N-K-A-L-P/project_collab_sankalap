import dbConnect from "@/lib/mongodb";
import Activity from "@/models/Activity";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Bell, UserPlus, ThumbsUp, LogIn, MessageCircle, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import { formatDistanceToNowStrict } from "date-fns";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await dbConnect();
  const userId = (session.user as any).id;

  const activitiesItems = await Activity.find({ actorId: { $ne: userId } })
    .populate({ path: "actorId", model: User, select: "name avatar role" })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean({ strictPopulate: false });

  const activities = JSON.parse(JSON.stringify(activitiesItems));

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case "FOLLOW":
        return { icon: <UserPlus className="w-4 h-4 text-primary" />, bg: "bg-primary-light border-primary/15", label: "Connection" };
      case "VOTE":
        return { icon: <ThumbsUp className="w-4 h-4 text-amber-600" />, bg: "bg-amber-500/12 border-amber-500/20", label: "Upvote" };
      case "JOIN":
        return { icon: <LogIn className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-500/12 border-emerald-500/20", label: "Team" };
      case "COMMENT":
        return { icon: <MessageCircle className="w-4 h-4 text-primary" />, bg: "bg-primary-light border-primary/15", label: "Discussion" };
      case "CREATE_PROPOSAL":
        return { icon: <FileText className="w-4 h-4 text-primary" />, bg: "bg-primary-light border-primary/15", label: "Proposal" };
      default:
        return { icon: <Bell className="w-4 h-4 text-muted" />, bg: "bg-background border-border", label: "Activity" };
    }
  };

  const getMessage = (activity: any) => {
    const actorName = activity.actorId?.name || "Someone";
    const target = activity.metadata?.title;
    switch (activity.type) {
      case "FOLLOW":
        return <><strong className="font-semibold text-foreground">{actorName}</strong> started following you</>;
      case "VOTE":
        return <><strong className="font-semibold text-foreground">{actorName}</strong> upvoted <span className="text-primary font-semibold">{target}</span></>;
      case "JOIN":
        return <><strong className="font-semibold text-foreground">{actorName}</strong> requested to join <span className="text-primary font-semibold">{target}</span></>;
      case "CREATE_PROPOSAL":
        return <><strong className="font-semibold text-foreground">{actorName}</strong> submitted a new proposal: <span className="font-semibold text-foreground">{target}</span></>;
      case "COMMENT":
        return <><strong className="font-semibold text-foreground">{actorName}</strong> commented on <span className="text-primary font-semibold">{target}</span></>;
      default:
        return <><strong className="font-semibold text-foreground">{actorName}</strong> interacted with your workspace</>;
    }
  };

  function timeAgo(dateStr: string) {
    try { return formatDistanceToNowStrict(new Date(dateStr), { addSuffix: true }); }
    catch { return "recently"; }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="saas-card-featured p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light border border-primary/15 text-[11px] font-semibold text-primary">
            <Bell className="w-3.5 h-3.5" />
            Activity Stream
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Notifications</h1>
          <p className="text-sm text-muted">
            Stay updated with proposal votes, comments, and contributor activity.
          </p>
        </div>
        <span className="pill-primary text-xs font-semibold px-3 py-1 rounded-full">
          {activities.length} recent update{activities.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Compact Notification Timeline */}
      <div className="saas-card overflow-hidden divide-y divide-border">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">All caught up!</p>
            <p className="text-xs text-muted mt-1">No new notifications right now.</p>
          </div>
        ) : (
          activities.map((activity: any, idx: number) => {
            const cfg = getBadgeConfig(activity.type);
            const isRecent = idx < 3;
            return (
              <div
                key={activity._id.toString()}
                className={`flex items-start gap-3.5 px-5 py-4 transition-colors ${
                  isRecent ? "bg-primary-light/25 hover:bg-primary-light/40" : "hover:bg-background/60"
                }`}
              >
                <div className={`mt-0.5 w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground/90 leading-snug">
                      {getMessage(activity)}
                    </p>
                    {isRecent && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="Recent" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10.5px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                      {cfg.label}
                    </span>
                    <span className="text-xs text-muted">· {timeAgo(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
