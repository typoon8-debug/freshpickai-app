"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export interface MyCoupon {
  issuanceId: string;
  couponId: string;
  couponName: string;
  storeName: string | null;
  storeId: string | null;
  discountUnit: string;
  discountValue: number;
  minOrderAmount: number;
  expiresAt: string | null;
  issuedAt: string;
  status: "AVAILABLE" | "USED" | "EXPIRED";
}

export interface ClaimableCoupon {
  couponId: string;
  couponName: string;
  discountUnit: string;
  discountValue: number;
  minOrderAmount: number;
  validTo: string;
}

async function getCustomerId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("fp_user_profile")
    .select("ref_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.ref_customer_id) return profile.ref_customer_id as string;

  const { data: customer } = await admin
    .from("customer")
    .select("customer_id")
    .eq("email", user.email)
    .maybeSingle();
  return (customer?.customer_id as string) ?? null;
}

/** 내 쿠폰 목록 (사용 상태 포함) */
export async function getMyCouponsWithStatus(): Promise<MyCoupon[]> {
  const customerId = await getCustomerId();
  if (!customerId) return [];

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // 1. coupon_issurance 조회
  const { data: issuances } = await admin
    .from("coupon_issurance")
    .select("issuance_id, coupon_id, issued_status, issued_at, expires_at")
    .eq("customer_id", customerId)
    .order("issued_at", { ascending: false });

  if (!issuances || issuances.length === 0) return [];

  const couponIds = [...new Set(issuances.map((i) => i.coupon_id))];
  const issuanceIds = issuances.map((i) => i.issuance_id);

  // 2. coupon 정보 배치 조회 (name, discount_unit이 실제 컬럼명)
  const { data: coupons } = await admin
    .from("coupon")
    .select("coupon_id, name, discount_unit, discount_value, min_order_amount, store_id")
    .in("coupon_id", couponIds);

  // 3. store 이름 배치 조회
  const storeIds = [...new Set((coupons ?? []).map((c) => c.store_id).filter(Boolean))];
  const storeMap = new Map<string, string>();
  if (storeIds.length > 0) {
    const { data: stores } = await admin
      .from("store")
      .select("store_id, name")
      .in("store_id", storeIds);
    (stores ?? []).forEach((s) => storeMap.set(s.store_id, s.name));
  }

  // 4. coupon_redemption에서 APPLIED 상태 조회
  const { data: redemptions } = await admin
    .from("coupon_redemption")
    .select("issuance_id")
    .in("issuance_id", issuanceIds)
    .eq("status", "APPLIED");

  const usedIssuanceIds = new Set((redemptions ?? []).map((r) => r.issuance_id));
  const couponMap = new Map((coupons ?? []).map((c) => [c.coupon_id, c]));

  return issuances.map((iss) => {
    const coupon = couponMap.get(iss.coupon_id);
    const isUsed = iss.issued_status === "USED" || usedIssuanceIds.has(iss.issuance_id);
    const isExpired = !isUsed && iss.expires_at != null && iss.expires_at < now;

    let status: MyCoupon["status"] = "AVAILABLE";
    if (isUsed) status = "USED";
    else if (isExpired) status = "EXPIRED";

    return {
      issuanceId: iss.issuance_id,
      couponId: iss.coupon_id,
      couponName: coupon?.name ?? "쿠폰",
      storeName: coupon?.store_id ? (storeMap.get(coupon.store_id) ?? null) : null,
      storeId: coupon?.store_id ?? null,
      discountUnit: coupon?.discount_unit ?? "FIXED",
      discountValue: coupon?.discount_value ?? 0,
      minOrderAmount: coupon?.min_order_amount ?? 0,
      expiresAt: iss.expires_at ?? null,
      issuedAt: iss.issued_at,
      status,
    };
  });
}

/** 내 가게에서 받을 수 있는 쿠폰 목록 */
export async function getClaimableCoupons(storeId: string): Promise<ClaimableCoupon[]> {
  const customerId = await getCustomerId();
  if (!customerId) return [];

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // 가게의 유효한 쿠폰 조회
  const { data: storeCoupons } = await admin
    .from("coupon")
    .select("coupon_id, name, discount_unit, discount_value, min_order_amount, valid_to")
    .eq("store_id", storeId)
    .eq("status", "ACTIVE")
    .lte("valid_from", now)
    .gte("valid_to", now);

  if (!storeCoupons || storeCoupons.length === 0) return [];

  // 이미 발급된 쿠폰 제외
  const { data: alreadyIssued } = await admin
    .from("coupon_issurance")
    .select("coupon_id")
    .eq("customer_id", customerId)
    .in(
      "coupon_id",
      storeCoupons.map((c) => c.coupon_id)
    );

  const issuedCouponIds = new Set((alreadyIssued ?? []).map((i) => i.coupon_id));

  return storeCoupons
    .filter((c) => !issuedCouponIds.has(c.coupon_id))
    .map((c) => ({
      couponId: c.coupon_id,
      couponName: c.name,
      discountUnit: c.discount_unit,
      discountValue: c.discount_value,
      minOrderAmount: c.min_order_amount,
      validTo: c.valid_to,
    }));
}

/** 쿠폰 받기 */
export async function claimCoupon(couponId: string): Promise<{ error?: string }> {
  const customerId = await getCustomerId();
  if (!customerId) return { error: "로그인이 필요합니다." };

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // 유효성 검증
  const { data: coupon } = await admin
    .from("coupon")
    .select("coupon_id, status, valid_from, valid_to, per_customer_limit")
    .eq("coupon_id", couponId)
    .maybeSingle();

  if (!coupon) return { error: "쿠폰을 찾을 수 없습니다." };
  if (coupon.status !== "ACTIVE") return { error: "사용할 수 없는 쿠폰입니다." };
  if (coupon.valid_from > now || coupon.valid_to < now)
    return { error: "유효기간이 지난 쿠폰입니다." };

  // 중복 발급 체크
  const { count } = await admin
    .from("coupon_issurance")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .eq("coupon_id", couponId);

  const limit = coupon.per_customer_limit ?? 1;
  if ((count ?? 0) >= limit) return { error: "이미 받은 쿠폰입니다." };

  const { error } = await admin.from("coupon_issurance").insert({
    customer_id: customerId,
    coupon_id: couponId,
    issued_status: "ISSUED",
    issued_at: now,
    expires_at: coupon.valid_to,
  });

  return error ? { error: error.message } : {};
}
