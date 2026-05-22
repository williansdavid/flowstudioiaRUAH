import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "user" | null;

export interface AuthData {
  session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"];
  role: UserRole;
}

export function useAuth() {
  return useQuery<AuthData>({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) return { session: null, role: null };

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      return {
        session,
        role: (profile?.role ?? "user") as UserRole,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
