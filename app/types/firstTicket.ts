export interface FirstTicket {
  id?: number;          
  header: string;
  message: string;
  files?: File[];        
  attachments?: string[]; 
  share: string;
}
