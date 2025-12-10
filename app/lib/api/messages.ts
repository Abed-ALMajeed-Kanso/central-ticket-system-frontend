import api from "../connectors/api";
import { Message} from "../../types/message";

const getTicketMessages = async (
  ticketId: number,
  messageQuery?: string,
  attachmentQuery?: string
): Promise<Message[]> => {
  const params: Record<string, any> = {};

  if (messageQuery) params.messageQuery = messageQuery;
  if (attachmentQuery) params.attachmentQuery = attachmentQuery;

  const response = await api.get<Message[]>(`/tickets/${ticketId}/messages`, {
    params,
  });

  return response.data;
};

const sendTicketMessage = async (
  ticketId: number,
  message: string,
  files?: File[],
  share?: string
): Promise<Message> => {
  const formData = new FormData();
  formData.append("message", message);

  if (files && files.length > 0) {
    files.forEach((file) => formData.append("files", file));
  }

    if (share !== undefined) {
    formData.append("share", share.toString());
  }

  const response = await api.post<Message>(
    `/tickets/${ticketId}/messages`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

const updateTicketViewStatus = async (ticketId: number): Promise<void> => {
  try {
    await api.post(`/tickets/${ticketId}/view`);
  } catch (error) {
    console.error(`Failed to update view status for ticket ${ticketId}`, error);
    throw error;
  }
};


export { getTicketMessages, sendTicketMessage, updateTicketViewStatus };