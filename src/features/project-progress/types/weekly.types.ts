export interface CreateWeeklyReportInput {
  projectId: string;
  completedTasks: string[];
  blockers?: string;
  nextWeekPlan?: string;
}

export interface WeeklyReport {
  _id: string;
  projectId: string;
  userId: string;
  userName: string;
  completedTasks: string[];
  blockers: string;
  nextWeekPlan: string;
  createdAt: string;
}
