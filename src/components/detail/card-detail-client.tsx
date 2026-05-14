"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { DetailHeader } from "@/components/detail/detail-header";
import { CardFlipper } from "@/components/detail/card-flipper";
import { HealthScoreSection } from "@/components/detail/health-score-section";
import { PriceCompareSection } from "@/components/detail/price-compare-section";
import { DishList } from "@/components/detail/dish-list";
import { IngredientMetaBlock } from "@/components/detail/ingredient-meta-block";
import { CardNoteSection } from "@/components/detail/card-note-section";
import { ShareButton } from "@/components/detail/share-button";
import { CookModeButton } from "@/components/detail/cook-mode-button";
import { DetailFooter } from "@/components/detail/detail-footer";
import type { CardDetail } from "@/lib/actions/cards/detail";
import type { CardNote } from "@/lib/types";

// 드로어는 열릴 때만 필요하므로 초기 번들에서 제외
const NoteWriteDrawer = dynamic(
  () => import("@/components/detail/note-write-drawer").then((m) => m.NoteWriteDrawer),
  { ssr: false }
);

const THEME_LABELS: Record<string, string> = {
  chef_table: "흑백요리사",
  one_meal: "한 끼",
  family_recipe: "엄마손맛",
  drama_recipe: "드라마한끼",
  honwell: "혼웰빙",
  seasonal: "제철한상",
  global_plate: "글로벌",
  k_dessert: "K디저트",
  snack_pack: "간식팩",
  cinema_night: "홈시네마",
};

interface CardDetailClientProps {
  detail: CardDetail;
}

export function CardDetailClient({ detail }: CardDetailClientProps) {
  const [noteDrawerOpen, setNoteDrawerOpen] = useState(false);
  const [notes, setNotes] = useState<CardNote[]>(detail.notes);

  const themeName = THEME_LABELS[detail.cardTheme] ?? detail.cardTheme;
  const mainDish = detail.dishes[0];
  const allIngredients = detail.dishes.flatMap((d) => d.ingredients);

  function handleNoteCreated(note: CardNote) {
    setNotes((prev) => [note, ...prev]);
  }

  return (
    <>
      <DetailHeader cardName={detail.name} themeName={themeName} />

      <div className="flex flex-col gap-4 px-4 pt-2 pb-28">
        {/* 공유 + 요리하기 버튼 */}
        <div className="flex items-center justify-between">
          <CookModeButton cardId={detail.cardId} />
          <ShareButton
            cardId={detail.cardId}
            cardName={detail.name}
            cardEmoji={detail.emoji}
            cardDescription={detail.description}
          />
        </div>

        {/* 카드 flip */}
        {mainDish && <CardFlipper dish={mainDish} ingredients={mainDish.ingredients} />}

        {/* 건강 점수 — 3지표 실 데이터 */}
        <HealthScoreSection healthScore={detail.healthScore} healthScore3={detail.healthScore3} />

        {/* 가격 비교 — 제철 할인 반영 */}
        <PriceCompareSection price={detail.priceMin} priceCompare={detail.priceCompare} />

        {/* 음식 목록 + 대표 레시피 (F022) */}
        <DishList dishes={detail.dishes} />

        {/* 재료 메타 (F018) */}
        <IngredientMetaBlock metas={detail.ingredientMetas} />

        {/* 사용자 노트 (F016) */}
        <CardNoteSection
          cardId={detail.cardId}
          notes={notes}
          onNotesChange={setNotes}
          onWrite={() => setNoteDrawerOpen(true)}
        />
      </div>

      {/* 노트 작성 Drawer */}
      <NoteWriteDrawer
        open={noteDrawerOpen}
        onClose={() => setNoteDrawerOpen(false)}
        cardId={detail.cardId}
        onNoteCreated={handleNoteCreated}
      />

      {/* 하단 CTA */}
      <DetailFooter cardId={detail.cardId} ingredients={allIngredients} />
    </>
  );
}
