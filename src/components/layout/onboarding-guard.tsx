"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useStoresHydrated } from "@/hooks/use-stores-hydrated";

export function OnboardingGuard() {
  const router = useRouter();
  const storesHydrated = useStoresHydrated();
  const { onboardingCompletedAt, onboardingSkippedAt } = useAuthStore();

  useEffect(() => {
    if (!storesHydrated) return;
    if (onboardingCompletedAt === null && onboardingSkippedAt === null) {
      router.replace("/onboarding");
    }
  }, [storesHydrated, onboardingCompletedAt, onboardingSkippedAt, router]);

  return null;
}
