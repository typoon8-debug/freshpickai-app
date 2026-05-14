import { getDailyPick } from "@/lib/actions/cards";
import { DailyHero } from "./daily-hero";

export async function DailyHeroLoader() {
  const dailyCard = await getDailyPick();
  return <DailyHero card={dailyCard ?? undefined} />;
}
