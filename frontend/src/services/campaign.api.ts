import type { Contact } from "./contacts.api";
import { apiRequest } from "./api";

export interface CampaignPayload {
  messageTemplate: string;
  recipientIds: string[];
  imageUrl?: string;
}

export interface CampaignHistoryItem {
  _id: string;
  messageTemplate: string;
  imageUrl?: string;
  optOutText: string;
  sentCount: number;
  status: string;
  recipients: Contact[];
  errors: Array<{ contact: Contact; message: string }>;
  createdAt: string;
}

export const campaignApi = {
  sendCampaign: async (payload: CampaignPayload) =>
    apiRequest.post<unknown, CampaignPayload>("/campaigns/send", payload),

  fetchCampaigns: async (): Promise<CampaignHistoryItem[]> => {
    const response = await apiRequest.get<CampaignHistoryItem[]>("/campaigns");
    if (!response.success) {
      throw new Error(response.message || "Could not load campaigns");
    }
    return response.data;
  },

  fetchCampaignById: async (id: string): Promise<CampaignHistoryItem> => {
    const response = await apiRequest.get<CampaignHistoryItem>(`/campaigns/${id}`);
    if (!response.success) {
      throw new Error(response.message || "Could not load campaign");
    }
    return response.data;
  },
};
