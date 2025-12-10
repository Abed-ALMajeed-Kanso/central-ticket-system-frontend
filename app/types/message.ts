export interface Message {
  id: number;
  message: string;
  attachments: string[];
  senderId: number;
  createdAt: string;
  share?: string;
}
