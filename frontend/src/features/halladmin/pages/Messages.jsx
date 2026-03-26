import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MoreHorizontal, Search, MessageSquare } from "lucide-react";
import { API_BASE_URL, API_SERVER_URL } from "../../../shared/config/api.js";
import { useAuth } from "../../../shared/hooks/useAuth.js";

const sortAsc = (arr) => [...arr].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

const fmtTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const dateLabel = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  return isToday ? "Today" : d.toLocaleDateString();
};

export default function HallAdminMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  const scrollStyles = {
    scrollbarColor: "rgba(255,255,255,0.25) transparent",
    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": { width: 8 },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(255,255,255,0.3)",
      borderRadius: 12,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "rgba(229,9,20,0.7)",
    },
    "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
  };

  const selectedConversation = useMemo(
    () => conversations.find((c) => Number(c.id) === Number(selectedId)) || null,
    [conversations, selectedId],
  );

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await axios.get(`${API_BASE_URL}/chat/conversations`, { withCredentials: true });
      const list = Array.isArray(res.data) ? res.data : [];
      setConversations(list);
      if (list.length > 0 && !selectedId) setSelectedId(list[0].id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load conversations.");
    } finally {
      setLoadingConversations(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedId) return;
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await axios.get(`${API_BASE_URL}/chat/${selectedId}/messages?page=1`, {
          withCredentials: true,
        });
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
    const socket = io(API_SERVER_URL, { query: { userId: String(user.id) }, transports: ["websocket"] });
    socket.on("newMessage", (newMessage) => {
      if (!newMessage?.conversation_id) return;
      setConversations((prev) => {
        const exists = prev.some((c) => Number(c.id) === Number(newMessage.conversation_id));
        if (!exists) {
          fetchConversations();
          return prev;
        }
        return prev
          .map((conv) =>
            Number(conv.id) === Number(newMessage.conversation_id)
              ? { ...conv, lastMessage: newMessage.message, lastMessageAt: newMessage.createdAt }
              : conv,
          )
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      });
      if (Number(newMessage.conversation_id) === Number(selectedId)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return sortAsc([...prev, newMessage]);
        });
      }
    });
    return () => socket.disconnect();
  }, [fetchConversations, selectedId, user?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      [c.user?.fullname, c.user?.email, c.Hall?.hall_name, c.lastMessage]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [conversations, query]);

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
      const msg = res.data?.data || res.data;
      if (!msg?.id) throw new Error("Unexpected response from server");
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : sortAsc([...prev, msg])));
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

  const renderAvatar = (display) => {
    const initials = display
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>{initials}</Avatar>;
  };

  const renderMessages = () => {
    let lastDate = "";
    return messages.map((msg) => {
      const label = dateLabel(msg.createdAt);
      const showDivider = label !== lastDate;
      lastDate = label;
      const mine = Number(msg.sender_id) === Number(user?.id);
      return (
        <React.Fragment key={msg.id}>
          {showDivider && (
            <Stack direction="row" alignItems="center" spacing={1} my={1.5}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Stack>
          )}
          <Stack alignItems={mine ? "flex-end" : "flex-start"} spacing={0.3} mb={1.5}>
            <Box
              sx={{
                maxWidth: "78%",
                px: 1.75,
                py: 1.1,
                borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                bgcolor: mine ? "primary.main" : "background.paper",
                color: mine ? "#000" : "text.primary",
                border: mine ? "none" : "1px solid",
                borderColor: mine ? "transparent" : "divider",
                boxShadow: mine ? "0 10px 30px rgba(229,9,20,0.25)" : "none",
              }}
            >
              <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                {msg.message}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {fmtTime(msg.createdAt)}
            </Typography>
          </Stack>
        </React.Fragment>
      );
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: "calc(100vh - 108px)", md: "calc(100vh - 92px)" },
        maxHeight: { xs: "calc(100vh - 108px)", md: "calc(100vh - 92px)" },
        pt: { xs: 3, md: 5 },
        px: { xs: 2, md: 3 },
        pb: { xs: 2, md: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          minHeight: 0,
          maxHeight: "100%",
          borderRadius: { xs: 2, md: 2 },
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, rgba(229,9,20,0.04), rgba(10,10,10,1))",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "360px 1fr" },
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Conversation rail */}
          <Box
            sx={{
              borderRight: { md: "1px solid", xs: "none" },
              borderColor: "divider",
              minHeight: 0,
              bgcolor: "background.paper",
            }}
          >
            <Box px={3} py={2.5} borderBottom="1px solid" borderColor="divider">
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
               
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                User chats for your halls
              </Typography>
              <Box mt={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={16} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
            <Box
              sx={{
                height: "calc(100% - 96px)",
                overflowY: "auto",
                scrollbarGutter: "stable",
                ...scrollStyles,
              }}
            >
              {loadingConversations ? (
                <Typography px={3} py={2} variant="body2" color="text.secondary">
                  Loading conversations...
                </Typography>
              ) : filteredConversations.length === 0 ? (
                <Typography px={3} py={2} variant="body2" color="text.secondary">
                  No conversations found.
                </Typography>
              ) : (
                <List disablePadding>
                  {filteredConversations.map((conv) => {
                    const active = Number(conv.id) === Number(selectedId);
                    const display = conv.user?.fullname || conv.user?.email || "User";
                    return (
                      <ListItem key={conv.id} disablePadding>
                        <ListItemButton
                          onClick={() => setSelectedId(conv.id)}
                          selected={active}
                          sx={{
                            alignItems: "flex-start",
                            py: 1.2,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              variant="dot"
                              color="success"
                              overlap="circular"
                              invisible={!conv.lastMessageAt}
                            >
                              {renderAvatar(display)}
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                <Typography variant="body2" fontWeight={700} noWrap>
                                  {display}
                                </Typography>
                                {conv.lastMessageAt && (
                                  <Typography variant="caption" color="text.secondary">
                                    {fmtTime(conv.lastMessageAt)}
                                  </Typography>
                                )}
                              </Stack>
                            }
                            secondary={
                              <Stack spacing={0.3}>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {conv.Hall?.hall_name || "Hall"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {conv.lastMessage || "No messages yet"}
                                </Typography>
                              </Stack>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          </Box>

          {/* Chat pane */}
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Box
              px={4}
              py={6}
              borderBottom="1px solid"
              borderColor="divider"
              bgcolor="background.paper"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
              minHeight={80}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                {selectedConversation ? renderAvatar(selectedConversation.user?.fullname || selectedConversation.user?.email || "User") : (
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "rgba(229,9,20,0.14)",
                      color: "primary.main",
                      border: "1px solid",
                      borderColor: "rgba(229,9,20,0.35)",
                    }}
                  >
                    <MessageSquare size={20} />
                  </Avatar>
                )}
                <Box sx={!selectedConversation ? { mt: 1 } : undefined}>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    {selectedConversation
                      ? selectedConversation.user?.fullname || selectedConversation.user?.email || "User"
                      : "Messages"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                    {selectedConversation?.Hall?.hall_name || "—"}
                  </Typography>
                  {!selectedConversation ? (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      Select a conversation to start replying
                    </Typography>
                  ) : null}
                </Box>
              </Stack>
              <IconButton
                sx={{
                  color: "text.primary",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "rgba(255,255,255,0.03)",
                }}
              >
                <MoreHorizontal size={18} />
              </IconButton>
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                scrollbarGutter: "stable",
                p: 3,
                bgcolor: "background.default",
                ...scrollStyles,
              }}
            >
              {loadingMessages ? (
                <Typography variant="body2" color="text.secondary">
                  Loading messages...
                </Typography>
              ) : messages.length === 0 ? (
                <Stack height="100%" alignItems="center" justifyContent="center" spacing={1} color="text.secondary">
                  <MessageSquare size={32} />
                  <Typography variant="body2">No messages in this conversation.</Typography>
                </Stack>
              ) : (
                renderMessages()
              )}
              <div ref={endRef} />
            </Box>

            <Divider />
            <Box component="form" onSubmit={sendMessage} px={3} py={2} bgcolor="background.paper">
              {error ? (
                <Typography variant="caption" color="error" display="block" mb={1}>
                  {error}
                </Typography>
              ) : null}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={selectedId ? "Write a message..." : "Select conversation first"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!selectedId}
                  InputProps={{
                    endAdornment: selectedConversation ? (
                      <Chip label={selectedConversation.Hall?.hall_name || "Hall"} size="small" variant="outlined" />
                    ) : null,
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!selectedId || !input.trim() || sending}
                  sx={{ minWidth: 120 }}
                >
                  {sending ? "Sending..." : "Send"}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
