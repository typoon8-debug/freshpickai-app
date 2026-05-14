import { Suspense } from "react";
import { BrandHeader } from "@/components/layout/brand-header";
import { DailyHeroLoader } from "@/components/home/daily-hero-loader";
import { CardsSectionLoader } from "@/components/home/cards-section-loader";
import {
  DailyHeroSkeleton,
  AIRecommendSkeleton,
  HomeBoardSkeleton,
} from "@/components/ui/skeleton";

function CardsSectionFallback() {
  return (
    <>
      <AIRecommendSkeleton />
      <HomeBoardSkeleton />
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <BrandHeader />
      <main className="flex flex-col gap-4 px-4 pt-4 pb-24">
        <Suspense fallback={<DailyHeroSkeleton />}>
          <DailyHeroLoader />
        </Suspense>
        <Suspense fallback={<CardsSectionFallback />}>
          {/* AIRecommendSection + HomeBoard 데이터를 단일 fetch로 공유 */}
          <CardsSectionLoader />
        </Suspense>
      </main>
    </>
  );
}
