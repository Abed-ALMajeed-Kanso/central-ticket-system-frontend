export interface Ticket {
  id: number;
  header: string;
  status: string;
  createdAt: string;
  userId: number;   
  adminId: number; 
  viewedByUser: boolean;
  viewedByAdmin: boolean;
}
