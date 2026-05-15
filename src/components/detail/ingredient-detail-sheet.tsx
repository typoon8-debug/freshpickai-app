"use client";

import { Sparkles, ChefHat, FileText, Bot } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Chip } from "@/components/ui/chip";
import type { Ingredient } from "@/lib/types";
import { parseDescriptionSections, parseCookingUsage } from "@/lib/utils/item-parsers";

interface Props {
  ingredient: Ingredient;
  open: boolean;
  onClose: () => void;
}

export function IngredientDetailSheet({ ingredient, open, onClose }: Props) {
  const live = ingredient.liveData;

  const price = live?.effectiveSalePrice ?? live?.salePrice;
  const hasDiscount =
    (live?.discountPct ?? 0) > 0 &&
    live?.listPrice != null &&
    live?.effectiveSalePrice != null &&
    live.listPrice > live.effectiveSalePrice;

  const descSections = live?.descriptionMarkup
    ? parseDescriptionSections(live.descriptionMarkup)
    : [];
  const cookingUsages = live?.aiCookingUsage ? parseCookingUsage(live.aiCookingUsage) : [];
  const aiConfidencePct =
    live?.aiConfidence != null ? Math.round(Number(live.aiConfidence) * 100) : null;

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
          {/* 가격 정보 */}
          {price != null && (
            <div>
              <div className="flex items-baseline gap-2">
                {hasDiscount && (
                  <span className="text-lg font-bold text-red-500">
                    {Math.round(live!.discountPct!)}%
                  </span>
                )}
                <span className="text-ink-900 text-2xl font-bold">{price.toLocaleString()}원</span>
              </div>
              {hasDiscount && (
                <p className="text-ink-400 mt-0.5 text-sm line-through">
                  {live!.listPrice!.toLocaleString()}원
                </p>
              )}
              {live?.promoName && (
                <span className="bg-mocha-100 text-mocha-700 mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                  {live.promoName}
                </span>
              )}
            </div>
          )}

          {/* 품절 뱃지 */}
          {live?.isInStock === false && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600">
              현재 품절된 상품입니다
            </div>
          )}

          {/* AI 태그 */}
          {live?.aiTags && live.aiTags.length > 0 && (
            <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
              {live.aiTags.map((tag) => (
                <Chip key={tag} size="sm" variant="outline" className="shrink-0">
                  {tag}
                </Chip>
              ))}
            </div>
          )}

          {/* AI 추천 문구 */}
          {live?.aiAdCopy && (
            <div className="rounded-xl bg-green-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-green-700">
                <Sparkles size={13} />
                AI 추천 문구
              </p>
              <p className="text-ink-700 text-sm leading-relaxed">{live.aiAdCopy}</p>
            </div>
          )}

          {/* AI 제품 설명 */}
          {descSections.length > 0 && (
            <div>
              <h3 className="text-ink-900 mb-3 flex items-center gap-1.5 text-sm font-bold">
                <FileText size={14} className="text-mocha-500" />
                AI 제품 설명
              </h3>
              <div className="space-y-3">
                {descSections.map((sec) => (
                  <div key={sec.title}>
                    <p className="text-ink-800 mb-1 text-sm font-bold">{sec.title}</p>
                    <p className="text-ink-600 text-[13px] leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 요리 활용법 */}
          {cookingUsages.length > 0 && (
            <div className="border-line rounded-xl border bg-white p-4">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-amber-600">
                <ChefHat size={15} />
                요리 활용법
              </p>
              <ul className="space-y-2">
                {cookingUsages.map(({ key, value }) => (
                  <li key={key} className="text-ink-700 text-[13px] leading-snug">
                    <span className="text-ink-800 font-bold">{key}</span>
                    <span className="text-ink-500">: {value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 영양 정보 */}
          {live?.aiCalories && (
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-ink-400 mb-2 text-xs font-medium">영양 정보 (100g 기준)</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <NutrientCell label="열량" value={`${live.aiCalories.total ?? 0}kcal`} highlight />
                <NutrientCell label="탄수화물" value={`${live.aiCalories.carb ?? 0}g`} />
                <NutrientCell label="단백질" value={`${live.aiCalories.protein ?? 0}g`} />
                <NutrientCell label="지방" value={`${live.aiCalories.fat ?? 0}g`} />
              </div>
            </div>
          )}

          {/* AI 분석 정보 */}
          {aiConfidencePct != null && (
            <p className="text-ink-400 flex items-center gap-1.5 text-xs">
              <Bot size={12} />
              AI 분석 정보 · 신뢰도 {aiConfidencePct}%
            </p>
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
      <p className="text-ink-400 text-xs">{label}</p>
      <p
        className={`mt-0.5 text-sm font-semibold ${highlight ? "text-mocha-700" : "text-ink-800"}`}
      >
        {value}
      </p>
    </div>
  );
}
