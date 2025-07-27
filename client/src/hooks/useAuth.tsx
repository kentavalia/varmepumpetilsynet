import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/user"],
    retry: false,
    // Transform 401 errors to null (not authenticated)
    queryFn: async () => {
      try {
        const response = await fetch("/api/user");
        if (response.status === 401) {
          return null;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        return await response.json();
      } catch (error) {
        return null;
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logget ut",
        description: "Du er nå logget ut av systemet.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      // Force logout even if request fails
      queryClient.setQueryData(["/api/user"], null);
      setLocation("/");
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}