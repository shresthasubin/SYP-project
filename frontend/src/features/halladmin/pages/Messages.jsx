import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { MessageSquare } from "lucide-react";
import { API_BASE_URL, API_SERVER_URL } from "../../../shared/config/api.js";
import { useAuth } from "../../../shared/hooks/useAuth.js";

const sortAsc = (arr) =>
  [...arr].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

const fmtTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function HallAdminMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  const selectedConversation = useMemo(
    () => conversations.find((c) => Number(c.id) === Number(selectedId)) || null,
    [conversations, selectedId],
  );

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        const res = await axios.get(`${API_BASE_URL}/chat/conversations`, {
          withCredentials: true,
        });
        const list = Array.isArray(res.data) ? res.data : [];
        setConversations(list);
        if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load conversations.");
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await axios.get(
          `${API_BASE_URL}/chat/${selectedId}/messages?page=1`,
          { withCredentials: true },
        );
        const list = Array.isArray(res.data) ? res.data : [];
        setMessages(sortAsc(list));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load messages.");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedId]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = io(API_SERVER_URL, {
      query: { userId: String(user.id) },
      transports: ["websocket"],
    });

    socket.on("newMessage", (newMessage) => {
      if (!newMessage?.conversation_id) return;

      setConversations((prev) =>
        prev
          .map((conv) => {
            if (Number(conv.id) !== Number(newMessage.conversation_id)) return conv;
            return {
              ...conv,
              lastMessage: newMessage.message,
              lastMessageAt: newMessage.createdAt,
            };
          })
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)),
      );

      if (Number(newMessage.conversation_id) === Number(selectedId)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return sortAsc([...prev, newMessage]);
        });
      }
    });

    return () => socket.disconnect();
  }, [selectedId, user?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !selectedId || sending) return;

    setSending(true);
    setInput("");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/chat/${selectedId}/message`,
        { message: content },
        { withCredentials: true },
      );
      const msg = res.data;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return sortAsc([...prev, msg]);
      });
      setConversations((prev) =>
        prev
          .map((conv) =>
            Number(conv.id) === Number(selectedId)
              ? { ...conv, lastMessage: msg.message, lastMessageAt: msg.createdAt }
              : conv,
          )
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message.");
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-white/10 bg-black">
      <div className="grid h-full grid-cols-1 md:grid-cols-[320px_1fr]">
        <aside className="border-r border-white/10 bg-[#0b1324]">
          <div className="border-b border-white/10 px-4 py-3">
            <h1 className="text-lg font-semibold text-white">Messages</h1>
            <p className="text-xs text-slate-400">User chats for your halls</p>
          </div>

          <div className="h-[calc(100%-64px)] overflow-y-auto">
            {loadingConversations ? (
              <p className="p-4 text-sm text-slate-400">Loading conversations...</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">No conversations yet.</p>
            ) : (
              conversations.map((conv) => {
                const active = Number(conv.id) === Number(selectedId);
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full border-b border-white/5 px-4 py-3 text-left transition ${
                      active ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <p className="truncate text-sm font-semibold text-white">
                      {conv.user?.fullname || conv.user?.email || "User"}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {conv.Hall?.hall_name || "Hall"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex h-full flex-col bg-[#070c18]">
          <header className="border-b border-white/10 px-4 py-3">
            {selectedConversation ? (
              <>
                <p className="text-sm font-semibold text-white">
                  {selectedConversation.user?.fullname || selectedConversation.user?.email || "User"}
                </p>
                <p className="text-xs text-slate-400">
                  {selectedConversation.Hall?.hall_name || "Hall"}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-400">Select a conversation</p>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-4">
            {loadingMessages ? (
              <p className="text-sm text-slate-400">Loading messages...</p>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                  <p className="text-sm">No messages in this conversation.</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const mine = Number(msg.sender_id) === Number(user?.id);
                return (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                        mine ? "bg-[#f4e451] text-black" : "bg-[#18253f] text-white"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className={`mt-1 text-[11px] ${mine ? "text-black/70" : "text-slate-400"}`}>
                        {fmtTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-white/10 p-3">
            {error ? <p className="mb-2 text-xs text-red-400">{error}</p> : null}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!selectedId}
                placeholder={selectedId ? "Type a message..." : "Select conversation first"}
                className="flex-1 rounded-lg border border-white/15 bg-[#111b2f] px-3 py-2 text-sm text-white outline-none focus:border-[#f4e451] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!selectedId || !input.trim() || sending}
                className="rounded-lg bg-[#f4e451] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
