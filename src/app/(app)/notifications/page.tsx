import dbConnect from "@/lib/mongodb";
import Activity from "@/models/Activity";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Bell, UserPlus, ThumbsUp, LogIn, MessageCircle } from "lucide-react";
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

  const getIcon = (type: string) => {
    switch (type) {
      case "FOLLOW":          return <UserPlus className="w-4 h-4 text-primary" />;
      case "VOTE":            return <ThumbsUp className="w-4 h-4 text-amber-500" />;
      case "JOIN":            return <LogIn className="w-4 h-4 text-emerald-600" />;
      case "COMMENT":         return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "CREATE_PROPOSAL": return <Bell className="w-4 h-4 text-primary" />;
      default:                return <Bell className="w-4 h-4 text-muted" />;
    }
  };

  const getMessage = (activity: any) => {
    const actorName = activity.actorId?.name || "Someone";
    const target = activity.metadata?.title;
    switch (activity.type) {
      case "FOLLOW":
        return <><strong>{actorName}</strong> started following you</>;
      case "VOTE":
        return <><strong>{actorName}</strong> upvoted <span className="text-primary font-medium">{target}</span></>;
      case "JOIN":
        return <><strong>{actorName}</strong> requested to join <span className="text-primary font-medium">{target}</span></>;
      case "CREATE_PROPOSAL":
        return <><strong>{actorName}</strong> submitted a new proposal: <span className="font-medium">{target}</span></>;
      case "COMMENT":
        return <><strong>{actorName}</strong> commented on <span className="text-primary font-medium">{target}</span></>;
      default:
        return <><strong>{actorName}</strong> performed an action</>;
    }
  };

  function timeAgo(dateStr: string) {
    try { return formatDistanceToNowStrict(new Date(dateStr), { addSuffix: true }); }
    catch { return "recently"; }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-card border-l-4 border-l-primary border border-border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted mt-1">
          Stay updated with votes, comments, and member activity.
        </p>
      </div>

      {/* Notification list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="w-10 h-10 text-muted/30 mb-3" />
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted mt-1">No new notifications right now.</p>
          </div>
        ) : (
          activities.map((activity: any) => (
            <div
              key={activity._id.toString()}
              className="flex items-start gap-4 px-5 py-4 hover:bg-background/60 transition-colors"
            >
              <div className="mt-0.5 w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">
                  {getMessage(activity)}
                </p>
                <p className="text-xs text-muted mt-1">{timeAgo(activity.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
