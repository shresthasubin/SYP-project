import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { API_BASE_URL, API_SERVER_URL } from "../../../shared/config/api.js";

const sortMessagesAsc = (list) =>
  [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

const formatTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function LiveChatModal({
  isOpen,
  onClose,
  hallId,
  hallName,
  currentUserId,
}) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const endRef = useRef(null);

  const canSend = useMemo(
    () => Boolean(input.trim()) && !sending && Boolean(conversationId),
    [conversationId, input, sending],
  );

  useEffect(() => {
    if (!isOpen || !hallId) return;

    const init = async () => {
      try {
        setLoading(true);
        setError("");
        setMessages([]);

        const startRes = await axios.post(
          `${API_BASE_URL}/chat/start`,
          { hall_id: hallId },
          { withCredentials: true },
        );

        const conversation = startRes.data;
        if (!conversation?.id) {
          setError("Could not start chat.");
          return;
        }

        setConversationId(conversation.id);

        const messagesRes = await axios.get(
          `${API_BASE_URL}/chat/${conversation.id}/messages?page=1`,
          { withCredentials: true },
        );
        const initialMessages = Array.isArray(messagesRes.data)
          ? messagesRes.data
          : [];
        setMessages(sortMessagesAsc(initialMessages));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load chat.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [hallId, isOpen]);

  useEffect(() => {
    if (!isOpen || !currentUserId) return;

    const socket = io(API_SERVER_URL, {
      query: { userId: String(currentUserId) },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("newMessage", (newMessage) => {
      if (!newMessage?.conversation_id || !conversationId) return;
      if (Number(newMessage.conversation_id) !== Number(conversationId)) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return sortMessagesAsc([...prev, newMessage]);
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId, currentUserId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages]);

  useEffect(() => {
    if (!isOpen) {
      setConversationId(null);
      setMessages([]);
      setInput("");
      setError("");
      setLoading(false);
      setSending(false);
    }
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!canSend) return;

    const content = input.trim();
    setSending(true);
    setInput("");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/chat/${conversationId}/message`,
        { message: content },
        { withCredentials: true },
      );
      const created = res.data;
      setMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        return sortMessagesAsc([...prev, created]);
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message.");
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-3 md:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#0b1220] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-sm text-slate-300">Live Chat</p>
            <h3 className="text-base font-semibold">{hallName || "Cinema Hall"}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="h-[52vh] overflow-y-auto bg-[#070d18] p-4 md:h-[56vh]">
          {loading ? <p className="text-sm text-slate-400">Loading chat...</p> : null}
          {!loading && messages.length === 0 ? (
            <p className="text-sm text-slate-400">No messages yet. Start the conversation.</p>
          ) : null}
          {messages.map((msg) => {
            const mine = Number(msg.sender_id) === Number(currentUserId);
            return (
              <div
                key={msg.id}
                className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    mine ? "bg-[#f4e451] text-black" : "bg-[#18253f] text-slate-100"
                  }`}
                >
                  <p>{msg.message}</p>
                  <p className={`mt-1 text-[11px] ${mine ? "text-black/70" : "text-slate-400"}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-white/10 p-3">
          {error ? <p className="mb-2 text-xs text-red-400">{error}</p> : null}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-white/15 bg-[#111b2f] px-3 py-2 text-sm outline-none focus:border-[#f4e451]"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="rounded-lg bg-[#f4e451] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
