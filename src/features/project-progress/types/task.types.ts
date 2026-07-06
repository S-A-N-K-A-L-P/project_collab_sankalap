export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedToName?: string;
  priority: "low" | "medium" | "high";
  deadline: string;
}
