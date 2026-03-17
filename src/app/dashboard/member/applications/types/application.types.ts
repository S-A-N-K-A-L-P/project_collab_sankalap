export interface Application {
  id: string;
  projectId: string;
  status: 'pending' | 'accepted' | 'rejected';
}
