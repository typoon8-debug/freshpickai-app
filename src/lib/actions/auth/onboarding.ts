"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingValues } from "@/components/auth/onboarding-form";

const ONBOARDING_COOKIE = "fp_onboarded";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

function parseCookTimeMin(cookTime: string): number {
  if (cookTime.includes("10")) return 10;
  if (cookTime.includes("30")) return 30;
  return 60;
}

function parseBudgetLevel(budget: string): "low" | "mid" | "high" {
  if (budget.includes("1만원")) return "low";
  if (budget.includes("2만원")) return "mid";
  return "high";
}

export async function saveOnboarding(values: OnboardingValues): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false };

  const now = new Date().toISOString();

  // 기존 persona_tags 유지 + household 태그만 교체
  const { data: existingPref } = await supabase
    .from("fp_user_preference")
    .select("persona_tags")
    .eq("user_id", user.id)
    .maybeSingle();

  const prevTags: string[] = existingPref?.persona_tags ?? [];
  const nextTags = [
    ...prevTags.filter((t) => !t.startsWith("household:")),
    `household:${values.householdSize}`,
  ];

  const [prefResult, profileResult] = await Promise.all([
    supabase.from("fp_user_preference").upsert(
      {
        user_id: user.id,
        wellness_goals: values.wellnessTags,
        cook_time_min: parseCookTimeMin(values.cookTime),
        budget_level: parseBudgetLevel(values.budget),
        persona_tags: nextTags,
        modified_at: now,
      },
      { onConflict: "user_id" }
    ),
    supabase.from("fp_user_profile").upsert(
      {
        user_id: user.id,
        display_name:
          (user.user_metadata?.full_name as string | undefined) ??
          user.email?.split("@")[0] ??
          "사용자",
        onboarded_at: now,
        modified_at: now,
      },
      { onConflict: "user_id" }
    ),
  ]);

  if (prefResult.error || profileResult.error) {
    return { success: false };
  }

  // 온보딩 완료 쿠키 설정
  const cookieStore = await cookies();
  cookieStore.set(ONBOARDING_COOKIE, "done", {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });

  return { success: true };
}

export async function skipOnboardingAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const now = new Date().toISOString();
    // 스킵 시각을 DB에도 기록
    await supabase
      .from("fp_user_preference")
      .upsert(
        { user_id: user.id, onboarding_skipped_at: now, modified_at: now },
        { onConflict: "user_id" }
      );
  }

  // 스킵도 완료로 처리해 다시 가드에 걸리지 않도록
  const cookieStore = await cookies();
  cookieStore.set(ONBOARDING_COOKIE, "skipped", {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });
}

export async function resetOnboardingAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // DB 상태 초기화 (onboarded_at, onboarding_skipped_at)
    await Promise.all([
      supabase
        .from("fp_user_profile")
        .update({ onboarded_at: null, modified_at: new Date().toISOString() })
        .eq("user_id", user.id),
      supabase
        .from("fp_user_preference")
        .update({ onboarding_skipped_at: null, modified_at: new Date().toISOString() })
        .eq("user_id", user.id),
    ]);
  }

  // 쿠키 삭제 후 온보딩 페이지로 이동
  const cookieStore = await cookies();
  cookieStore.delete(ONBOARDING_COOKIE);

  redirect("/onboarding");
}
