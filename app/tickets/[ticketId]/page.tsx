"use client";

import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs"; 
import { useParams } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { Ticket } from "../../types/ticket";
import { Message } from "../../types/message";
import { getTicketById } from "../../lib/api/tickets";
import { getTicketMessages, sendTicketMessage, updateTicketViewStatus } from "../../lib/api/messages";
import { createStompClient } from "../../lib/connectors/socket";
import { formatDate } from "../../utils/dateHelpers";

export default function TicketDetails() {
  const { user } = useUser();
  const params = useParams();
  const role = user?.role || "ROLE_USER";

  const ticketIdRaw = Array.isArray(params.ticketId) ? params.ticketId[0] : params.ticketId;
  const ticketId = Number(ticketIdRaw);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareToSlack, setShareToSlack] = useState(false);

  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  if (isNaN(ticketId)) return <p>Invalid Ticket ID</p>;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    getTicketById(ticketId).then(setTicket);
  }, [ticketId]);

  useEffect(() => {
    if (!ticket) return;
    updateTicketViewStatus(ticket.id).catch(console.error);
  }, [ticket, messages.length]);

  useEffect(() => {
    if (!ticket) return;
    setLoading(true);
    getTicketMessages(ticket.id)
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [ticket]);

  useEffect(() => {
    if (!ticketId) return;
    const client = createStompClient([
      {
        topic: `/topic/tickets/${ticketId}`,
        callback: (msg) => {
          const newMsg: Message = JSON.parse(msg.body);
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
          );
        },
      },
      {
        topic: `/topic/tickets/view-status/${ticketId}`,
        callback: (msg) => {
          const status = JSON.parse(msg.body);
          console.log("View status:", status);
        },
      },
    ]);

    stompClient.current = client;
    return () => client.deactivate();
  }, [ticketId]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachments(Array.from(e.target.files));
  };

  const handleSend = async () => {
    if (!ticket || (!newMessage.trim() && attachments.length === 0)) return;

    try {
      await sendTicketMessage(ticket.id, newMessage, attachments, shareToSlack.toString());
      await updateTicketViewStatus(ticket.id);
      setNewMessage("");
      setAttachments([]);
      setShareToSlack(false);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!ticket) return <p>Loading ticket...</p>;

  const groupedMessages: Record<string, Message[]> = {};
  messages.forEach((msg) => {
    const dateKey = formatDate(new Date(msg.createdAt || Date.now()));
    if (!groupedMessages[dateKey]) groupedMessages[dateKey] = [];
    groupedMessages[dateKey].push(msg);
  });

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-cyan-300 to-sky-600 p-8 pt-24">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-xl p-8 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-center relative after:block after:w-16 after:h-1 after:bg-blue-600 after:mx-auto after:mt-2">
          {ticket.header}
        </h1>

        {loading && <p>Loading messages...</p>}

        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto bg-gray-100 p-4 rounded">
          {Object.keys(groupedMessages).map((date) => (
            <div key={date} className="flex flex-col gap-2">
              <div className="text-center text-gray-500 text-sm my-2">{date}</div>
              {groupedMessages[date].map((msg, index) => {
                const createdDate = new Date(msg.createdAt || Date.now());
                const isMyMessage =
                  role === "ROLE_USER" ? msg.senderId === ticket.userId : msg.senderId === ticket.adminId;

                return (
                  <div
                    key={msg.id ?? `msg-${index}`}
                    className={`flex flex-col p-3 rounded-lg max-w-[70%] ${
                      isMyMessage ? "bg-blue-100 self-end" : "bg-gray-200 self-start"
                    }`}
                  >
                    <p>{msg.message}</p>
                    {msg.attachments?.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        {msg.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-800 underline text-sm"
                          >
                            {att.split("/").pop()}
                          </a>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-700 mt-2 text-right">
                      {createdDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="sticky bottom-0 bg-white flex flex-col gap-3 p-2"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="border rounded px-3 py-2"
              onKeyDown={handleKeyDown}
            />

            <input
              type="file"
              multiple
              onChange={handleFiles}
              className="border rounded px-3 py-2"
            />

            {attachments.length > 0 && (
              <div className="flex flex-col gap-1 text-sm text-gray-700">
                {attachments.map((file, i) => (
                  <p key={i}>📎 {file.name}</p>
                ))}
              </div>
            )}

            {role === "ROLE_ADMIN" && (
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                <input
                  type="checkbox"
                  checked={shareToSlack}
                  onChange={(e) => setShareToSlack(e.target.checked)}
                  className="accent-blue-600 w-4 h-4"
                />
                <span>Share this message to Slack</span>
              </label>
            )}

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
