import { apiRequest } from "./api";

export interface WhatsAppStatus {
  isConnected: boolean;
  qrCode: string | null;
  hasAuth: boolean;
  error?: string | null;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: number;
  unread: boolean;
}

export interface Message {
  id: string;
  from: string;
  timestamp: number;
  text: string;
  hasMedia: boolean;
  fromMe: boolean;
}

export const whatsappApi = {
  getStatus: async (): Promise<WhatsAppStatus> => {
    const response = await apiRequest.get<WhatsAppStatus>("/whatsapp/status");
    if (!response.success) {
      throw new Error(response.message || "Could not get WhatsApp status");
    }
    return response.data;
  },

  generateNewQR: async () => {
    const response = await apiRequest.post("/whatsapp/generate-qr");
    if (!response.success) {
      throw new Error(response.message || "Could not generate new QR");
    }
    return response;
  },

  logout: async () => {
    const response = await apiRequest.post("/whatsapp/logout");
    if (!response.success) {
      throw new Error(response.message || "Could not logout from WhatsApp");
    }
    return response;
  },

  getChats: async (): Promise<Chat[]> => {
    const response = await apiRequest.get<Chat[]>("/whatsapp/chats");
    if (!response.success) {
      throw new Error(response.message || "Could not get chats");
    }
    return response.data;
  },

  getChatMessages: async (chatId: string): Promise<Message[]> => {
    const response = await apiRequest.get<Message[]>(`/whatsapp/chats/${encodeURIComponent(chatId)}/messages`);
    if (!response.success) {
      throw new Error(response.message || "Could not get messages");
    }
    return response.data;
  },

  sendMessage: async (chatId: string, text: string) => {
    const response = await apiRequest.post(`/whatsapp/chats/${encodeURIComponent(chatId)}/messages`, { text });
    if (!response.success) {
      throw new Error(response.message || "Could not send message");
    }
    return response;
  },

  markChatAsRead: async (chatId: string) => {
    const response = await apiRequest.post(`/whatsapp/chats/${encodeURIComponent(chatId)}/read`);
    if (!response.success) {
      throw new Error(response.message || "Could not mark as read");
    }
    return response;
  },
};
