import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { PostalCode, InsertPostalCode } from "@shared/schema";

export function usePostalCodes() {
  return useQuery<PostalCode[]>({
    queryKey: ["/api/postal-codes"],
    queryFn: async () => {
      const response = await fetch("/api/postal-codes");
      if (!response.ok) throw new Error("Failed to fetch postal codes");
      return response.json();
    },
  });
}

export function usePostalCodeLookup(postalCode: string) {
  return useQuery<PostalCode | null>({
    queryKey: ["/api/postal-codes", postalCode],
    queryFn: async () => {
      if (!postalCode || postalCode.length < 4) return null;
      
      try {
        const response = await fetch(`/api/postal-codes/${postalCode}`);
        if (!response.ok) return null;
        return response.json();
      } catch {
        return null;
      }
    },
    enabled: Boolean(postalCode && postalCode.length >= 4),
  });
}

export function usePostalCodeSearch(query: string) {
  return useQuery<PostalCode[]>({
    queryKey: ["/api/postal-codes/search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const response = await fetch(`/api/postal-codes/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: Boolean(query && query.length >= 2),
  });
}

export function useCreatePostalCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertPostalCode) => {
      return await apiRequest("POST", "/api/postal-codes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/postal-codes"] });
    },
  });
}

export function useUpdatePostalCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PostalCode> }) => {
      return await apiRequest("PUT", `/api/postal-codes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/postal-codes"] });
    },
  });
}

export function useDeletePostalCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/postal-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/postal-codes"] });
    },
  });
}