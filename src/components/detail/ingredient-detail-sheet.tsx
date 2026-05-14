"use client";

import DOMPurify from "isomorphic-dompurify";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Chip } from "@/components/ui/chip";
import type { Ingredient } from "@/lib/types";

interface Props {
  ingredient: Ingredient;
  open: boolean;
  onClose: () => void;
}

export function IngredientDetailSheet({ ingredient, open, onClose }: Props) {
  const live = ingredient.liveData;

  const safeMarkup = live?.descriptionMarkup ? DOMPurify.sanitize(live.descriptionMarkup) : null;

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="max-h-[85vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2 text-lg font-semibold">
            {ingredient.emoji && <span>{ingredient.emoji}</span>}
            {live?.itemName ?? ingredient.name}
            {live?._showReviewBadge && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                AI 분석 보완 중
              </span>
            )}
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-6">
          {/* AI 광고 카피 */}
          {live?.aiAdCopy && (
            <p className="text-muted-foreground text-sm italic">{live.aiAdCopy}</p>
          )}

          {/* AI 태그 */}
          {live?.aiTags && live.aiTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {live.aiTags.map((tag) => (
                <Chip key={tag} size="sm" variant="outline">
                  {tag}
                </Chip>
              ))}
            </div>
          )}

          {/* 칼로리 카드 (full 레벨만) */}
          {live?.aiCalories && (
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                영양 정보 (100g 기준)
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <NutrientCell label="열량" value={`${live.aiCalories.total}kcal`} highlight />
                <NutrientCell label="탄수화물" value={`${live.aiCalories.carb}g`} />
                <NutrientCell label="단백질" value={`${live.aiCalories.protein}g`} />
                <NutrientCell label="지방" value={`${live.aiCalories.fat}g`} />
              </div>
            </div>
          )}

          {/* 가격 정보 */}
          {live && (live.effectiveSalePrice || live.salePrice || live.listPrice) && (
            <div className="rounded-xl border p-3">
              <p className="text-muted-foreground mb-1.5 text-xs font-medium">현재 가격</p>
              <PriceDisplay live={live} />
            </div>
          )}

          {/* 품절 뱃지 */}
          {live?.isInStock === false && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600">
              현재 품절된 상품입니다
            </div>
          )}

          {/* AI 설명 마크업 */}
          {safeMarkup && (
            <div
              className="prose prose-sm text-foreground max-w-none"
              dangerouslySetInnerHTML={{ __html: safeMarkup }}
            />
          )}

          {/* 조리 활용법 */}
          {live?.aiCookingUsage && (
            <div className="bg-primary/5 rounded-lg px-3 py-2.5 text-sm">
              <p className="mb-1 font-medium">조리 활용 팁</p>
              <p className="text-muted-foreground">{live.aiCookingUsage}</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function NutrientCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function PriceDisplay({ live }: { live: NonNullable<Ingredient["liveData"]> }) {
  const { effectiveSalePrice, salePrice, listPrice, discountPct, promoType, promoName } = live;

  const displayPrice = effectiveSalePrice ?? salePrice;
  const originalPrice = effectiveSalePrice ? (salePrice ?? listPrice) : listPrice;
  const showDiscount = discountPct && discountPct > 0;

  const promoLabel: Record<string, string> = {
    SALE: "🏷️ 세일",
    DISCOUNT_PCT: `💰 ${Math.round(discountPct ?? 0)}% 할인`,
    BUNDLE: "📦 묶음",
    TWO_PLUS_ONE: "🎁 N+1",
  };

  return (
    <div className="flex items-end gap-2">
      {displayPrice && (
        <span className="text-lg font-bold">{displayPrice.toLocaleString("ko-KR")}원</span>
      )}
      {showDiscount && originalPrice && (
        <span className="text-muted-foreground text-sm line-through">
          {originalPrice.toLocaleString("ko-KR")}원
        </span>
      )}
      {promoType && (
        <span className="bg-primary/10 text-primary ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
          {promoName ?? promoLabel[promoType]}
        </span>
      )}
    </div>
  );
}
