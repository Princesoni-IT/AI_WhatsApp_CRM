import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { whatsappApi } from "../../services/whatsapp.api";
import type { Chat, Message } from "../../services/whatsapp.api";
import { MessageCircle, Send, ArrowLeft, CheckCheck } from "lucide-react";

export default function Inbox() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState("");
  const queryClient = useQueryClient();

  const chatsQuery = useQuery({
    queryKey: ["whatsapp-chats"],
    queryFn: whatsappApi.getChats,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const syncContactsMutation = useMutation({
    mutationFn: () => fetch("http://localhost:5000/api/v1/whatsapp/sync-contacts", {
      method: "POST",
      credentials: "include",
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-chats"] });
      alert("Contacts synced! Check inbox now.");
    },
  });

  const messagesQuery = useQuery({
    queryKey: ["whatsapp-messages", selectedChat?.id],
    queryFn: () => whatsappApi.getChatMessages(selectedChat!.id),
    enabled: !!selectedChat,
    refetchInterval: 3000, // Refresh every 3 seconds when chat is open
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, text }: { chatId: string; text: string }) =>
      whatsappApi.sendMessage(chatId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-messages", selectedChat?.id] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-chats"] });
      setMessageText("");
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (chatId: string) => whatsappApi.markChatAsRead(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-chats"] });
    },
  });

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    if (chat.unread) {
      markAsReadMutation.mutate(chat.id);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !messageText.trim()) return;

    sendMessageMutation.mutate({
      chatId: selectedChat.id,
      text: messageText,
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", background: "#f0f2f5" }}>
      {/* Chat List */}
      <div
        style={{
          width: selectedChat ? "0" : "100%",
          maxWidth: "400px",
          background: "white",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s",
        }}
        className="chat-list"
      >
        {/* Header */}
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "12px" }}>
            <MessageCircle size={24} style={{ color: "#10b981" }} />
            Inbox
          </h2>
          <button
            onClick={() => syncContactsMutation.mutate()}
            disabled={syncContactsMutation.isPending}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #10b981",
              background: "#f0fdf4",
              color: "#10b981",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
            }}
          >
            {syncContactsMutation.isPending ? "Syncing..." : "Sync Contacts"}
          </button>
        </div>

        {/* Chats */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {chatsQuery.isLoading && (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
              Loading chats...
            </div>
          )}

          {chatsQuery.data?.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
              <MessageCircle size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <p>No chats yet</p>
              <p style={{ fontSize: "14px" }}>Send a campaign or wait for messages</p>
            </div>
          )}

          {chatsQuery.data?.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatSelect(chat)}
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f3f4f6",
                cursor: "pointer",
                background: selectedChat?.id === chat.id ? "#f0fdf4" : chat.unread ? "#fef3c7" : "white",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                if (selectedChat?.id !== chat.id) {
                  e.currentTarget.style.background = "#f9fafb";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedChat?.id !== chat.id) {
                  e.currentTarget.style.background = chat.unread ? "#fef3c7" : "white";
                }
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontWeight: chat.unread ? 700 : 600, fontSize: "15px" }}>
                  {chat.name}
                </span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  {chat.timestamp ? formatTime(chat.timestamp) : ""}
                </span>
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {chat.lastMessage || "No messages yet"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#e5ddd5" }}>
          {/* Chat Header */}
          <div style={{ padding: "16px 20px", background: "#f0f2f5", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setSelectedChat(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
              }}
              className="mobile-only"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>{selectedChat.name}</h3>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>{selectedChat.id.split("@")[0]}</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: "20px", overflow: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            {messagesQuery.isLoading && (
              <div style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
                Loading messages...
              </div>
            )}

            {messagesQuery.data?.map((msg) => (
              <div
                key={msg.id}
                style={{
                  maxWidth: "65%",
                  alignSelf: msg.fromMe ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: msg.fromMe ? "#d9fdd3" : "white",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "14px", wordBreak: "break-word" }}>{msg.text}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", marginTop: "4px" }}>
                    <span style={{ fontSize: "11px", color: "#667781" }}>
                      {formatTime(msg.timestamp)}
                    </span>
                    {msg.fromMe && (
                      <CheckCheck size={16} style={{ color: "#53bdeb" }} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: "12px 20px",
              background: "#f0f2f5",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: "12px",
            }}
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "24px",
                border: "none",
                fontSize: "14px",
                background: "white",
              }}
            />
            <button
              type="submit"
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              style={{
                padding: "12px 20px",
                borderRadius: "24px",
                border: "none",
                background: messageText.trim() ? "#10b981" : "#d1d5db",
                color: "white",
                cursor: messageText.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              <Send size={18} />
              Send
            </button>
          </form>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
          }}
          className="desktop-only"
        >
          <MessageCircle size={64} style={{ opacity: 0.3, marginBottom: "16px" }} />
          <p style={{ fontSize: "18px", fontWeight: 600 }}>Select a chat to start messaging</p>
          <p style={{ fontSize: "14px" }}>Your messages will appear here</p>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .chat-list {
            width: ${selectedChat ? "0 !important" : "100% !important"};
            max-width: none !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
          .chat-list {
            width: 400px !important;
          }
        }
      `}</style>
    </div>
  );
}
