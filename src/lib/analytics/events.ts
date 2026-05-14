// PostHog 이벤트 트래킹 모듈 (F021 공유 추적 등)
// Task 035에서 PostHog SDK 정식 통합 예정

export type ShareChannel = "kakao" | "web-share" | "clipboard";

interface PostHogWindow {
  posthog?: {
    capture(event: string, props: Record<string, unknown>): void;
  };
}

export function trackCardShared(cardId: string, channel: ShareChannel): void {
  const w = typeof window !== "undefined" ? (window as unknown as PostHogWindow) : null;
  if (w?.posthog) {
    w.posthog.capture("card_shared", { card_id: cardId, channel });
  }
  if (process.env.NODE_ENV === "development") {
    console.log("[analytics] card_shared", { cardId, channel });
  }
}
