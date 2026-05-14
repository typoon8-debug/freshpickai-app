// PostHog 이벤트 트래킹 모듈
// NEXT_PUBLIC_POSTHOG_KEY 없는 환경에서는 개발 모드 console.log 폴백

export type ShareChannel = "kakao" | "web-share" | "clipboard";

function capture(event: string, props: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  // posthog 싱글톤이 초기화된 경우 사용
  const ph = (
    window as unknown as { posthog?: { capture(e: string, p: Record<string, unknown>): void } }
  ).posthog;
  if (ph) {
    ph.capture(event, props);
  }
  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] ${event}`, props);
  }
}

export function trackCardShared(cardId: string, channel: ShareChannel): void {
  capture("card_shared", { card_id: cardId, channel });
}

export function trackCardViewed(cardId: string, cardName: string): void {
  capture("card_viewed", { card_id: cardId, card_name: cardName });
}

export function trackCartAdded(cardId: string, itemCount: number, totalPrice: number): void {
  capture("cart_added", { card_id: cardId, item_count: itemCount, total_price: totalPrice });
}

export function trackPaymentCompleted(orderId: string, amount: number, method: string): void {
  capture("payment_completed", { order_id: orderId, amount, method });
}

export function trackAiChatStarted(cardId?: string): void {
  capture("ai_chat_started", { card_id: cardId ?? null });
}

export function trackVoteCast(cardId: string, voteType: string): void {
  capture("vote_cast", { card_id: cardId, vote_type: voteType });
}
