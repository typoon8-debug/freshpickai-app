"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { GenderType, FamilyRoleType } from "@/lib/constants/relationship";
import type { FpUser } from "@/lib/types";

export type ProfileStats = {
  pointBalance: number;
  couponCount: number;
};

export type UpdateUserProfileInput = {
  familyRole?: FamilyRoleType;
  gender?: GenderType | null;
};

/** fp_user_profile의 familyRole·gender CRUD — 마이페이지 선호설정에서 호출 */
export async function updateUserProfile(
  input: UpdateUserProfileInput
): Promise<{ ok: boolean; profile?: FpUser; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };

  const updates: Record<string, unknown> = { modified_at: new Date().toISOString() };
  if (input.familyRole !== undefined) updates.family_role = input.familyRole;
  if ("gender" in input) updates.gender = input.gender ?? null;

  const { data, error } = await supabase
    .from("fp_user_profile")
    .update(updates)
    .eq("user_id", user.id)
    .select(
      "user_id, display_name, avatar_url, family_role, gender, level, onboarded_at, ref_customer_id"
    )
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "UPDATE_FAILED" };

  revalidatePath("/profile");

  return {
    ok: true,
    profile: {
      userId: data.user_id,
      displayName: data.display_name,
      avatarUrl: data.avatar_url ?? undefined,
      familyRole: data.family_role as FpUser["familyRole"],
      gender: (data.gender as GenderType | null) ?? null,
      level: data.level,
      onboardedAt: data.onboarded_at ?? undefined,
      refCustomerId: data.ref_customer_id ?? undefined,
    },
  };
}

/** 사용자 보유 포인트 + 사용 가능 쿠폰 수 조회 */
export async function getProfileStatsAction(): Promise<ProfileStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { pointBalance: 0, couponCount: 0 };

  const { data: profile } = await supabase
    .from("fp_user_profile")
    .select("ref_customer_id")
    .eq("user_id", user.id)
    .single();

  const customerId = profile?.ref_customer_id as string | null;
  if (!customerId) return { pointBalance: 0, couponCount: 0 };

  const [pointRes, couponRes] = await Promise.all([
    supabase
      .from("point_history")
      .select("balance_after")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("coupon_issurance")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId)
      .eq("status", "ACTIVE"),
  ]);

  return {
    pointBalance: (pointRes.data?.balance_after as number | null) ?? 0,
    couponCount: couponRes.count ?? 0,
  };
}
