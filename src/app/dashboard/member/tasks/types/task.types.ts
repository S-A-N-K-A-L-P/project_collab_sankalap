export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  assignedTo: string;
}
