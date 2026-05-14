"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import type { User } from "@supabase/supabase-js";

function mapSupabaseUser(user: User) {
  return {
    id: user.id,
    name:
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "사용자",
    email: user.email ?? "",
    avatar: user.user_metadata?.avatar_url as string | undefined,
    role: "parent" as const,
    level: 1,
  };
}

export function AuthSync() {
  const { login, logout } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        login(session.access_token, mapSupabaseUser(session.user));
      } else {
        logout();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        login(session.access_token, mapSupabaseUser(session.user));
      } else {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, [login, logout]);

  return null;
}
