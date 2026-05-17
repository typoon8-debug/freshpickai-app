"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInWithKakao(nextUrl?: string) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const confirmUrl = new URL(`${origin}/auth/confirm`);
  if (nextUrl?.startsWith("/")) confirmUrl.searchParams.set("next", nextUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: confirmUrl.toString(),
    },
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}
