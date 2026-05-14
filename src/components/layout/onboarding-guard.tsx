"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export function OnboardingGuard() {
  const router = useRouter();
  const { onboardingCompletedAt, onboardingSkippedAt } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  // Zustand persist 수화 완료 후에만 리다이렉트 체크
  useEffect(() => {
    const markHydrated = () => setHydrated(true);

    const unsub = useAuthStore.persist.onFinishHydration(markHydrated);

    // 이미 수화 완료된 경우 다음 microtask에서 setState (직접 호출 금지)
    if (useAuthStore.persist.hasHydrated()) {
      Promise.resolve().then(markHydrated);
    }

    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (onboardingCompletedAt === null && onboardingSkippedAt === null) {
      router.replace("/onboarding");
    }
  }, [hydrated, onboardingCompletedAt, onboardingSkippedAt, router]);

  return null;
}
