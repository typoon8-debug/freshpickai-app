"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, TicketPercent, Plus } from "lucide-react";
import { toast } from "sonner";
import { getMyCouponsWithStatus, type MyCoupon } from "@/lib/actions/coupon/index";
import CouponClaimSheet from "./CouponClaimSheet";

interface Props {
  initialCoupons: MyCoupon[];
  storeId: string | null;
}

type Tab = "available" | "used";

function formatDiscount(unit: string, value: number) {
  if (unit === "PERCENT") return `${value}% 할인`;
  return `${value.toLocaleString()}원 할인`;
}

function CouponCard({ coupon, dim }: { coupon: MyCoupon; dim?: boolean }) {
  const expiresAt = coupon.expiresAt
    ? new Date(coupon.expiresAt).toLocaleDateString("ko-KR", {
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
          <p className="text-ink-800 truncate text-sm font-bold">{coupon.couponName}</p>
          {coupon.storeName && <p className="text-ink-400 text-xs">{coupon.storeName}</p>}
          <p className="text-mocha-700 mt-0.5 text-base font-bold">
            {formatDiscount(coupon.discountUnit, coupon.discountValue)}
          </p>
          {coupon.minOrderAmount > 0 && (
            <p className="text-ink-400 mt-0.5 text-xs">
              {coupon.minOrderAmount.toLocaleString()}원 이상 구매 시
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
}

export default function CouponsClient({ initialCoupons, storeId }: Props) {
  const [tab, setTab] = useState<Tab>("available");
  const [coupons, setCoupons] = useState<MyCoupon[]>(initialCoupons);
  const [claimOpen, setClaimOpen] = useState(false);

  const available = coupons.filter((c) => c.status === "AVAILABLE");
  const used = coupons.filter((c) => c.status === "USED" || c.status === "EXPIRED");

  const handleClaimed = async () => {
    try {
      const fresh = await getMyCouponsWithStatus();
      setCoupons(fresh);
    } catch {
      toast.error("쿠폰 목록을 다시 불러오지 못했습니다.");
    }
  };

  const displayList = tab === "available" ? available : used;

  return (
    <div className="min-h-screen pb-12">
      {/* 헤더 */}
      <header className="border-line bg-paper sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
        <Link href="/profile" aria-label="뒤로가기">
          <ChevronLeft size={22} className="text-ink-700" />
        </Link>
        <h1 className="text-ink-800 flex-1 text-base font-bold">쿠폰함</h1>
        {storeId && (
          <button
            onClick={() => setClaimOpen(true)}
            className="text-mocha-700 flex items-center gap-1 text-sm font-medium"
          >
            <Plus size={16} />새 쿠폰 받기
          </button>
        )}
      </header>

      {/* 탭 */}
      <div className="border-line grid grid-cols-2 border-b">
        <button
          onClick={() => setTab("available")}
          className={`py-3 text-sm font-semibold transition-colors ${
            tab === "available" ? "text-mocha-700 border-mocha-700 border-b-2" : "text-ink-400"
          }`}
        >
          사용 가능 ({available.length})
        </button>
        <button
          onClick={() => setTab("used")}
          className={`py-3 text-sm font-semibold transition-colors ${
            tab === "used" ? "text-mocha-700 border-mocha-700 border-b-2" : "text-ink-400"
          }`}
        >
          사용 완료·만료 ({used.length})
        </button>
      </div>

      {/* 목록 */}
      {displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <TicketPercent size={48} className="text-ink-200" />
          <p className="text-ink-500 text-sm font-medium">
            {tab === "available" ? "사용 가능한 쿠폰이 없어요" : "사용 완료·만료 쿠폰이 없어요"}
          </p>
          {tab === "available" && storeId && (
            <button
              onClick={() => setClaimOpen(true)}
              className="bg-mocha-700 text-paper mt-2 rounded-xl px-5 py-2.5 text-sm font-bold"
            >
              쿠폰 받으러 가기
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-3 p-4">
          {displayList.map((c) => (
            <CouponCard key={c.issuanceId} coupon={c} dim={tab === "used"} />
          ))}
        </ul>
      )}

      {/* 새 쿠폰 받기 시트 */}
      {storeId && (
        <CouponClaimSheet
          open={claimOpen}
          onClose={() => setClaimOpen(false)}
          storeId={storeId}
          onClaimed={handleClaimed}
        />
      )}
    </div>
  );
}
