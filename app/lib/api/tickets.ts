import api from "../connectors/api";
import { TicketPage } from "../../types/ticketPage";
import { Ticket } from "../../types/ticket";
import { FirstTicket } from "../../types/firstTicket";

const fetchTickets = async ({
  page = 0,
  size = 10,
  status,
  header,
  sortByDate = "desc", 
  unread, 
}: {
  page?: number;
  size?: number;
  status?: string;
  header?: string;
  sortByDate?: "asc" | "desc";
  unread?: boolean; 
}): Promise<TicketPage> => {
  const params: Record<string, any> = {
    page,
    size,
    sortByDate,
  };

  if (status) params.status = status;
  if (header) params.header = header;
  if (unread !== undefined) params.unread = unread;

  const response = await api.get<TicketPage>("/tickets", { params });
  return response.data;
};

const getTicketById = async (ticketId: number | string): Promise<Ticket> => {
  try {
    const res = await api.get<Ticket>(`/tickets/${ticketId}`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch ticket with id ${ticketId}`, error);
    throw error;
  }
};

const createTicket = async (ticket: FirstTicket): Promise<FirstTicket> => {
  try {
    const formData = new FormData();
    formData.append("header", ticket.header);
    formData.append("message", ticket.message);
    formData.append("share", ticket.share);

    if (ticket.files) {
      ticket.files.forEach(file => {
        formData.append("files", file);
      });
    }
    

    const response = await api.post<FirstTicket>("/tickets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    throw error;
  }
};

const updateTicket = async (ticket: Ticket, id: number): Promise<Ticket> => {
try {
  const response = await api.put<Ticket>(`/tickets/${id}`, ticket);
  return response.data;
} catch (error: any) {
  console.error("Error updating ticket:", error.response?.data || error.message);
throw error;
  }
};


export { fetchTickets, getTicketById , createTicket, updateTicket};