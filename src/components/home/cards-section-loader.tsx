import { getCards } from "@/lib/actions/cards";
import { AIRecommendSection } from "./AIRecommendSection";
import { HomeBoard } from "./home-board";

export async function CardsSectionLoader() {
  const cards = await getCards({ officialOnly: true });
  return (
    <>
      <AIRecommendSection initialCards={cards} />
      <HomeBoard initialCards={cards} />
    </>
  );
}
