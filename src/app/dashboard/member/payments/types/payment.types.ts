export interface Payment {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
}
