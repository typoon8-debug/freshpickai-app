import { BrandHeader } from "@/components/layout/brand-header";
import { DailyHero } from "@/components/home/daily-hero";
import { HomeBoard } from "@/components/home/home-board";
import { AIRecommendSection } from "@/components/home/AIRecommendSection";
import { getCards, getDailyPick } from "@/lib/actions/cards";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [cards, dailyCard] = await Promise.all([getCards({ officialOnly: true }), getDailyPick()]);

  return (
    <>
      <BrandHeader />
      <main className="flex flex-col gap-4 px-4 pt-4 pb-24">
        <DailyHero card={dailyCard ?? undefined} />
        <AIRecommendSection initialCards={cards} />
        <HomeBoard initialCards={cards} />
      </main>
    </>
  );
}
