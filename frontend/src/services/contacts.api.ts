import api, { apiRequest } from "./api";
import type { ApiResponse } from "./api";

export interface ContactPayload {
  name: string;
  phoneNumber: string;
}

export interface Contact {
  _id: string;
  name: string;
  phoneNumber: string;
  shopkeeper: string;
  createdAt: string;
  updatedAt: string;
}

export const contactsApi = {
  fetchContacts: async (): Promise<ApiResponse<Contact[]>> =>
    apiRequest.get<Contact[]>("/contacts"),

  createContact: async (data: ContactPayload): Promise<ApiResponse<Contact>> =>
    apiRequest.post<Contact, ContactPayload>("/contacts/manual", data),

  uploadContacts: async (file: File): Promise<ApiResponse<Contact[]>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ApiResponse<Contact[]>>(
      "/contacts/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },
};
