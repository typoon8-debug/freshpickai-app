"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { TicketPercent, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { claimCoupon, getClaimableCoupons, type ClaimableCoupon } from "@/lib/actions/coupon/index";

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: string;
  onClaimed: () => void;
}

function formatDiscount(unit: string, value: number) {
  if (unit === "PERCENT") return `${value}% 할인`;
  return `${value.toLocaleString()}원 할인`;
}

export default function CouponClaimSheet({ open, onClose, storeId, onClaimed }: Props) {
  const [coupons, setCoupons] = useState<ClaimableCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getClaimableCoupons(storeId);
        if (!cancelled) setCoupons(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, storeId]);

  const handleClaim = async (couponId: string) => {
    setClaiming(couponId);
    const result = await claimCoupon(couponId);
    setClaiming(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("쿠폰이 발급되었습니다!");
    setCoupons((prev) => prev.filter((c) => c.couponId !== couponId));
    onClaimed();
  };

  return (
    <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content
          aria-describedby={undefined}
          className="bg-paper fixed right-0 bottom-0 left-0 z-50 mx-auto flex max-h-[80dvh] max-w-[480px] flex-col rounded-t-2xl"
        >
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-gray-300" />
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <Drawer.Title className="text-ink-800 text-base font-bold">새 쿠폰 받기</Drawer.Title>
            <button onClick={onClose}>
              <X size={20} className="text-ink-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {loading ? (
              <p className="text-ink-400 py-12 text-center text-sm">쿠폰을 불러오는 중...</p>
            ) : coupons.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <TicketPercent size={40} className="text-ink-200" />
                <p className="text-ink-500 text-sm">받을 수 있는 쿠폰이 없어요</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {coupons.map((c) => (
                  <li
                    key={c.couponId}
                    className="border-line flex items-center gap-3 rounded-xl border bg-white p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-ink-800 truncate text-sm font-bold">{c.couponName}</p>
                      <p className="text-mocha-700 mt-0.5 text-base font-bold">
                        {formatDiscount(c.discountUnit, c.discountValue)}
                      </p>
                      {c.minOrderAmount > 0 && (
                        <p className="text-ink-400 mt-0.5 text-xs">
                          {c.minOrderAmount.toLocaleString()}원 이상 구매 시
                        </p>
                      )}
                      <p className="text-ink-400 mt-0.5 text-xs">
                        {new Date(c.validTo).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        까지
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-mocha-700 shrink-0 text-white"
                      disabled={claiming === c.couponId}
                      onClick={() => handleClaim(c.couponId)}
                    >
                      {claiming === c.couponId ? "받는 중..." : "받기"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
