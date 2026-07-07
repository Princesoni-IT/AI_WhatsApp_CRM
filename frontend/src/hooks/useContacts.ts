import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Contact, ContactPayload } from "../services/contacts.api";
import { contactsApi } from "../services/contacts.api";

export const useContacts = () => {
  return useQuery<Contact[], Error>({
    queryKey: ["contacts"],
    queryFn: async (): Promise<Contact[]> => {
      const response = await contactsApi.fetchContacts();
      if (!response.success) {
        throw new Error(response.message || "Failed to load contacts");
      }
      return response.data;
    },
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation<Contact, Error, ContactPayload>({
    mutationFn: async (payload: ContactPayload): Promise<Contact> => {
      const response = await contactsApi.createContact(payload);
      if (!response.success) {
        throw new Error(response.message || "Create contact failed");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useUploadContacts = () => {
  const queryClient = useQueryClient();

  return useMutation<Contact[], Error, File>({
    mutationFn: async (file: File): Promise<Contact[]> => {
      const response = await contactsApi.uploadContacts(file);
      if (!response.success) {
        throw new Error(response.message || "Upload contacts failed");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};
