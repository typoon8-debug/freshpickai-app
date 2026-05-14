"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export function OnboardingGuard() {
  const router = useRouter();
  const { onboardingCompletedAt, onboardingSkippedAt, completeOnboarding, skipOnboarding } =
    useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const markHydrated = () => setHydrated(true);
    const unsub = useAuthStore.persist.onFinishHydration(markHydrated);
    if (useAuthStore.persist.hasHydrated()) {
      Promise.resolve().then(markHydrated);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    // fp_onboarded 쿠키가 있으면 온보딩 완료 → Zustand와 동기화 후 리다이렉트 스킵
    // (새 기기/쿠키 삭제로 Zustand가 null이어도 쿠키를 신뢰)
    const cookie = document.cookie;
    if (cookie.includes("fp_onboarded=done")) {
      if (onboardingCompletedAt === null) completeOnboarding();
      return;
    }
    if (cookie.includes("fp_onboarded=skipped")) {
      if (onboardingSkippedAt === null) skipOnboarding();
      return;
    }

    if (onboardingCompletedAt === null && onboardingSkippedAt === null) {
      router.replace("/onboarding");
    }
  }, [
    hydrated,
    onboardingCompletedAt,
    onboardingSkippedAt,
    router,
    completeOnboarding,
    skipOnboarding,
  ]);

  return null;
}
