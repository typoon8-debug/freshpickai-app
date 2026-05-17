"use client";

import dynamic from "next/dynamic";

// Firebase(~150KB)와 Realtime 구독 코드를 초기 번들에서 분리 — 인터랙션 후 지연 로드
const FcmInitializer = dynamic(
  () => import("@/components/push/FcmInitializer").then((m) => ({ default: m.FcmInitializer })),
  { ssr: false }
);
const NotificationProvider = dynamic(
  () =>
    import("@/components/push/NotificationProvider").then((m) => ({
      default: m.NotificationProvider,
    })),
  { ssr: false }
);

export function ClientProviders() {
  return (
    <>
      <FcmInitializer />
      <NotificationProvider />
    </>
  );
}
