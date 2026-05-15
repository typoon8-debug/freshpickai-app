import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, TicketPercent } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type CouponIssurance = {
  issuance_id: string;
  expires_at: string | null;
  issued_status: string | null;
  status: string | null;
  coupon: {
    coupon_name: string | null;
    discount_type: string | null;
    discount_value: number | null;
    min_order_amount: number | null;
  } | null;
};

export default async function CouponsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("fp_user_profile")
    .select("ref_customer_id")
    .eq("user_id", user.id)
    .single();

  let coupons: CouponIssurance[] = [];
  if (profile?.ref_customer_id) {
    const { data } = await supabase
      .from("coupon_issurance")
      .select(
        "issuance_id, expires_at, issued_status, status, coupon(coupon_name, discount_type, discount_value, min_order_amount)"
      )
      .eq("customer_id", profile.ref_customer_id as string)
      .eq("issued_status", "ISSUED")
      .order("expires_at", { ascending: true });
    coupons = (data ?? []) as unknown as CouponIssurance[];
  }

  const now = new Date();
  const available = coupons.filter((c) => !c.expires_at || new Date(c.expires_at) > now);
  const expired = coupons.filter((c) => c.expires_at && new Date(c.expires_at) <= now);

  const formatDiscount = (c: CouponIssurance) => {
    if (!c.coupon) return "";
    const { discount_type, discount_value } = c.coupon;
    if (discount_type === "PERCENT") return `${discount_value}% 할인`;
    if (discount_type === "FIXED") return `${discount_value?.toLocaleString()}원 할인`;
    return "";
  };

  const CouponCard = ({ coupon, dim }: { coupon: CouponIssurance; dim?: boolean }) => {
    const expiresAt = coupon.expires_at
      ? new Date(coupon.expires_at).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;
    return (
      <li
        className={`border-line rounded-xl border bg-white p-4 shadow-sm ${dim ? "opacity-50" : ""}`}
      >
        <div className="flex items-start gap-3">
          <TicketPercent size={20} className="text-mocha-500 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-ink-800 truncate text-sm font-bold">
              {coupon.coupon?.coupon_name ?? "쿠폰"}
            </p>
            <p className="text-mocha-700 mt-0.5 text-base font-bold">{formatDiscount(coupon)}</p>
            {coupon.coupon?.min_order_amount && (
              <p className="text-ink-400 mt-0.5 text-xs">
                {coupon.coupon.min_order_amount.toLocaleString()}원 이상 구매 시
              </p>
            )}
            {expiresAt && (
              <p className={`mt-1 text-xs ${dim ? "text-ink-300" : "text-terracotta"}`}>
                {dim ? "만료: " : "유효기간: "}
                {expiresAt}까지
              </p>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="min-h-screen pb-12">
      <header className="border-line bg-paper sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
        <Link href="/profile" aria-label="뒤로가기">
          <ChevronLeft size={22} className="text-ink-700" />
        </Link>
        <h1 className="text-ink-800 flex-1 text-base font-bold">쿠폰함</h1>
      </header>

      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <TicketPercent size={48} className="text-ink-200" />
          <p className="text-ink-500 text-sm font-medium">보유한 쿠폰이 없어요</p>
          <p className="text-ink-400 text-xs">이벤트에 참여하고 쿠폰을 받아보세요</p>
        </div>
      ) : (
        <div className="space-y-6 p-4">
          {available.length > 0 && (
            <section>
              <h2 className="text-ink-500 mb-3 text-xs font-bold tracking-wider uppercase">
                사용 가능 ({available.length})
              </h2>
              <ul className="space-y-3">
                {available.map((c) => (
                  <CouponCard key={c.issuance_id} coupon={c} />
                ))}
              </ul>
            </section>
          )}
          {expired.length > 0 && (
            <section>
              <h2 className="text-ink-300 mb-3 text-xs font-bold tracking-wider uppercase">
                만료됨 ({expired.length})
              </h2>
              <ul className="space-y-3">
                {expired.map((c) => (
                  <CouponCard key={c.issuance_id} coupon={c} dim />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
