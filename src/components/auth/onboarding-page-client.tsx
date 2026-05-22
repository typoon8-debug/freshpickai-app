"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { OnboardingCarousel } from "@/components/auth/onboarding-carousel";
import type { OnboardingValues } from "@/components/auth/onboarding-form";
import { useAuthStore } from "@/lib/store";
import { saveOnboarding, skipOnboardingAction } from "@/lib/actions/auth/onboarding";
import type { CardPreview } from "@/app/onboarding/page";

interface OnboardingPageClientProps {
  cardPreviews: CardPreview[];
  nextUrl?: string;
}

export function OnboardingPageClient({ cardPreviews, nextUrl = "/" }: OnboardingPageClientProps) {
  const router = useRouter();
  const { completeOnboarding, skipOnboarding } = useAuthStore();
  const [, startTransition] = useTransition();

  const handleComplete = (values?: OnboardingValues) => {
    startTransition(async () => {
      if (values) {
        await saveOnboarding(values); // DB 저장 + 쿠키 설정
        completeOnboarding(); // Zustand 동기화
      } else {
        await skipOnboardingAction(); // DB 저장 + 쿠키 설정
        skipOnboarding(); // Zustand 동기화
      }
      // 초대 링크 등 next 파라미터가 있으면 해당 경로로, 없으면 홈으로
      router.push(nextUrl);
    });
  };

  return <OnboardingCarousel onComplete={handleComplete} cardPreviews={cardPreviews} />;
}
