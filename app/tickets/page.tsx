"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Client } from "@stomp/stompjs"; 
import { fetchTickets, updateTicket } from "../lib/api/tickets";
import { getStatusBadge } from "../elements/getStatusBadge";
import { Ticket } from "../types/ticket";
import { TicketPage } from "../types/ticketPage";
import { motion } from "framer-motion";
import { createStompClient } from "../lib/connectors/socket";
import { useUser } from "../context/UserContext";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [unreadFilter, setUnreadFilter] = useState<boolean>(false);
  const [dateSort, setDateSort] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(5);
  const [pageInfo, setPageInfo] = useState<TicketPage | null>(null);
  const { user } = useUser();
  const role = user?.role || "ROLE_USER";
  const stompClient = useRef<Client | null>(null);
  const router = useRouter();
  const [newStatus] = useState("Active");
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});

  const loadTickets = async () => {
    setLoading(true);
    try {
      const unread = unreadFilter;
      const data = await fetchTickets({
        page,
        size: pageSize,
        header: headerSearch || undefined,
        status: statusFilter || undefined,
        sortByDate: dateSort,
        unread,
      });
      setTickets(data.content);
      setPageInfo(data);
    } finally {
      setLoading(false);
    }
  };

  // -------- Initial load & WebSocket --------
  useEffect(() => {
    loadTickets();
    const client = createStompClient([
      {
        topic: "/topic/tickets/new",
        callback: (msg) => {
          const newTicket: Ticket = JSON.parse(msg.body);
          setTickets((prev) => [newTicket, ...prev]);
        },
      },
      {
        topic: "/topic/tickets/view-update",
        callback: (msg) => {
          const update = JSON.parse(msg.body); 
          const { ticketId, viewedByUser, viewedByAdmin } = update;

          setTickets((prev) =>
            prev.map((t) =>
              t.id === ticketId
                ? { ...t, viewedByUser, viewedByAdmin }
                : t
            )
          );
        },
      },
    ]);
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  // -------- Pagination --------
  useEffect(() => {
    loadTickets();
  }, [page, pageSize]);

  // -------- Handle Filter Button --------
  const applyFilters = () => {
    setPage(0);
    loadTickets();
  };

  // -------- Render --------
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-cyan-300 to-sky-600 p-8 pt-24">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-xl p-8 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-center relative after:block after:w-16 after:h-1 after:bg-blue-600 after:mx-auto after:mt-2">
          My Tickets
        </h1>

        {/* Filters */}
        <div className="flex gap-3 mb-6 w-full">
          <input
            placeholder="Search tickets by header..."
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value as "asc" | "desc")}
            className="flex-1 border rounded px-3 py-2"
          >
            <option value="desc">Latest</option>
            <option value="asc">Oldest</option>
          </select>
          <select
            value={unreadFilter ? "all" : "unread"}
            onChange={(e) => setUnreadFilter(e.target.value === "all")}
            className="flex-1 border rounded px-3 py-2"
          >
            <option value="unread">Unread</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={applyFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Apply
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {/* Ticket List */}
        <div className="grid grid-cols-1 gap-4">
          {!loading && tickets.length === 0 && <p className="text-gray-500">No tickets found.</p>}
          {tickets.map((ticket) => {
            const isUnread =
              role === "ROLE_ADMIN"
                ? ticket.viewedByAdmin === false
                : ticket.viewedByUser === false;
                
               
                  
                
                  const handleUpdate = async () => {
                    try {
                      const updatedTicket = await updateTicket({ ...ticket, status: newStatus }, ticket.id);
                      setTickets((prev) =>
                        prev.map((t) => (t.id === ticket.id ? updatedTicket : t))
                      );
                      console.log("Updated ticket:", updatedTicket);
                    } catch (error) {
                      console.error("Error updating ticket:", error);
                    }
                  };
                

           return (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`cursor-pointer relative rounded-2xl border p-4 hover:shadow-lg ${
              isUnread ? "border-blue-500 shadow-[0_0_15px_2px_rgba(59,130,246,0.3)]" : ""
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div onClick={() => router.push(`/tickets/${ticket.id}`)}>
              <h2 className="text-xl font-semibold mb-1">{ticket.header}</h2>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(ticket.status)}
              </div>
            </div>
            {/* Admin Controls for Status Update */}
            {role === "ROLE_ADMIN" && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <select
                  value={statusMap[ticket.id] ?? ticket.status}
                  onChange={(e) =>
                    setStatusMap((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                  }
                  className="px-3 py-2 rounded-xl border border-gray-300 shadow-sm 
                            focus:outline-none focus:ring-2 focus:ring-blue-400 
                            focus:border-blue-500 transition bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>

                <button
                  onClick={async () => {
                    const updatedStatus = statusMap[ticket.id] ?? ticket.status;
                    try {
                      const updatedTicket = await updateTicket(
                        { ...ticket, status: updatedStatus },
                        ticket.id
                      );

                      setTickets((prev) =>
                        prev.map((t) => (t.id === ticket.id ? updatedTicket : t))
                      );

                      console.log("Updated ticket:", updatedTicket);
                    } catch (error) {
                      console.error("Error updating ticket:", error);
                    }
                  }}
                  className="bg-yellow-500 text-black px-3 py-1 rounded-xl
                            shadow-md hover:bg-yellow-600 transition"
                >
                  Update
                </button>
              </div>
            )}
            </motion.div>
              );
            })}
            </div>
        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <button
            disabled={page <= 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page + 1} of {pageInfo?.totalPages ?? 1}
          </span>
          <button
            disabled={page >= (pageInfo?.totalPages ?? 1) - 1}
            onClick={() => setPage((prev) => prev + 1)}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {role !== "ROLE_ADMIN" && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push("/create-ticket")}
              className="bg-green-600 text-white px-6 py-3 rounded shadow-md hover:bg-green-700"
            >
              Create Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
