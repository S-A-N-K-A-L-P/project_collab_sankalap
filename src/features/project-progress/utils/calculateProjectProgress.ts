export interface Task {
  _id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedToName?: string;
  priority: "low" | "medium" | "high";
  deadline: string;
  status: "pending" | "in-progress" | "completed";
  progress: number;
}

export interface ProjectProgressSummaryData {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  overallProgress: number;
  byPriority: { high: number; medium: number; low: number };
}

export function getProjectProgressSummary(tasks: Task[]): ProjectProgressSummaryData {
  const now = new Date();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const overdue = tasks.filter(
    (t) => t.status !== "completed" && new Date(t.deadline) < now
  ).length;

  const overallProgress =
    total === 0
      ? 0
      : Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total);

  const byPriority = {
    high: tasks.filter((t) => t.priority === "high" && t.status !== "completed").length,
    medium: tasks.filter((t) => t.priority === "medium" && t.status !== "completed").length,
    low: tasks.filter((t) => t.priority === "low" && t.status !== "completed").length,
  };

  return { total, completed, inProgress, pending, overdue, overallProgress, byPriority };
}
