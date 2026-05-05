"use client";

import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface OutOfRangeEmptyProps {
  /** 안내 메시지 커스터마이즈 */
  message?: string;
  /** CTA 버튼 레이블 */
  ctaLabel?: string;
  /** CTA 클릭 시 이동 경로 */
  ctaHref?: string;
  onCtaClick?: () => void;
}

export function OutOfRangeEmpty({
  message = "배송 가능한 매장이 없어요",
  ctaLabel = "기본 배송지 변경하기",
  ctaHref = "/mypage?drawer=addresses",
  onCtaClick,
}: OutOfRangeEmptyProps) {
  const router = useRouter();

  const handleCta = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      router.push(ctaHref);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
        <MapPin className="text-muted-foreground h-8 w-8" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-semibold">{message}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          배송 가능 매장은 회원님 기본 배송지로부터
          <br />
          매장이 정한 배송 반경 이내에 있어야 합니다.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={handleCta}>
        {ctaLabel}
      </Button>
    </div>
  );
}
