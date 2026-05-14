"use server";

import { createClient } from "@/lib/supabase/server";

export type ProfileStats = {
  pointBalance: number;
  couponCount: number;
};

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
