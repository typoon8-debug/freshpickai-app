"use client";

import { createClient } from "@/lib/supabase/client";

export async function signInWithGoogle(nextUrl?: string) {
  const supabase = createClient();
  const confirmUrl = new URL(`${window.location.origin}/auth/confirm`);
  if (nextUrl?.startsWith("/")) confirmUrl.searchParams.set("next", nextUrl);

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: confirmUrl.toString(),
    },
  });
}
