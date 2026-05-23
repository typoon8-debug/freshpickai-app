"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInWithKakao(nextUrl?: string) {
  const supabase = await createClient();
  // origin 헤더 없을 때 NEXT_PUBLIC_SITE_URL 폴백 (Vercel 프록시 환경 대비)
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

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
