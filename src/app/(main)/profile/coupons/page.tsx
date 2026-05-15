import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import CouponsClient from "@/components/profile/CouponsClient";
import { getMyCouponsWithStatus } from "@/lib/actions/coupon/index";

export default async function CouponsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  // 현재 사용 중인 가게 ID 조회 (새 쿠폰 받기 버튼 표시 여부)
  const { data: profile } = await admin
    .from("fp_user_profile")
    .select("ref_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let storeId: string | null = null;
  if (profile?.ref_customer_id) {
    const { data: customer } = await admin
      .from("customer")
      .select("store_id")
      .eq("customer_id", profile.ref_customer_id as string)
      .maybeSingle();
    storeId = (customer?.store_id as string | null) ?? null;
  }

  const coupons = await getMyCouponsWithStatus();

  return <CouponsClient initialCoupons={coupons} storeId={storeId} />;
}
