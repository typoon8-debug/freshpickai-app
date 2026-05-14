"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { shareCard, isKakaoShareReady } from "@/lib/share/kakao";
import { trackCardShared } from "@/lib/analytics/events";

interface ShareButtonProps {
  cardId: string;
  cardName?: string;
  cardEmoji?: string;
  cardDescription?: string;
}

export function ShareButton({ cardId, cardName, cardEmoji, cardDescription }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const previewUrl = `${window.location.origin}/cards/${cardId}/preview`;
    const title = cardName
      ? `${cardEmoji ?? ""} ${cardName} — FreshPick AI`.trim()
      : "FreshPick AI 카드메뉴";

    // 1순위: 카카오 SDK
    if (isKakaoShareReady()) {
      const ok = shareCard({
        cardId,
        cardName: cardName ?? "FreshPick 카드메뉴",
        cardEmoji,
        cardDescription,
      });
      if (ok) {
        trackCardShared(cardId, "kakao");
        return;
      }
    }

    // 2순위: Web Share API
    if (navigator.share) {
      try {
        await navigator.share({ title, url: previewUrl });
        trackCardShared(cardId, "web-share");
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }

    // 3순위: 클립보드 복사
    try {
      await navigator.clipboard.writeText(previewUrl);
      trackCardShared(cardId, "clipboard");
      setCopied(true);
      toast.success("링크가 복사되었어요! 카카오톡에 붙여넣어 공유해보세요.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("링크 복사에 실패했어요.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="bg-mocha-50 text-ink-500 hover:bg-mocha-100 hover:text-ink-700 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
      aria-label="공유하기"
      data-testid="share-button"
    >
      {copied ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
    </button>
  );
}
