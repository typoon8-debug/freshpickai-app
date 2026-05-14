"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import {
  matchIngredientToStoreItemAction,
  getIngredientMetaByNameAction,
} from "@/lib/actions/cards/create";
import { getIngredientHint } from "@/data/wizard-guide-keywords";
import type { StoreItemAiData, IngredientMeta } from "@/lib/types";

export interface IngredientEntry {
  name: string;
  qty: string;
  unit: string;
  storeItemId?: string;
  price?: number;
}

interface Step3IngredientsProps {
  ingredients: IngredientEntry[];
  budget: string;
  onIngredientsChange: (items: IngredientEntry[]) => void;
  onBudgetChange: (budget: string) => void;
}

export function Step3Ingredients({
  ingredients,
  budget,
  onIngredientsChange,
  onBudgetChange,
}: Step3IngredientsProps) {
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newUnit, setNewUnit] = useState("개");
  const [manualPrice, setManualPrice] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<StoreItemAiData | null>(null);
  const [ingredientMeta, setIngredientMeta] = useState<IngredientMeta | null>(null);
  const [metaExpanded, setMetaExpanded] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 500ms 디바운스 → AI 매칭 + 재료 메타 병렬 조회
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const trimmed = newName.trim();
    if (!trimmed) {
      const t = setTimeout(() => {
        setMatchResult(null);
        setIngredientMeta(null);
        setMetaExpanded(false);
      }, 0);
      return () => clearTimeout(t);
    }

    debounceTimer.current = setTimeout(async () => {
      setMatching(true);
      try {
        const [storeMatch, dbMeta] = await Promise.all([
          matchIngredientToStoreItemAction(trimmed),
          getIngredientMetaByNameAction(trimmed),
        ]);

        setMatchResult(storeMatch);
        if (dbMeta) {
          setIngredientMeta(dbMeta);
        } else {
          const staticHint = getIngredientHint(trimmed);
          setIngredientMeta(
            staticHint
              ? {
                  metaId: "",
                  name: trimmed,
                  prepTips: staticHint.prepTip,
                  substitutes: staticHint.substitutes ?? [],
                }
              : null
          );
        }

        const price = storeMatch?.effectiveSalePrice ?? storeMatch?.salePrice;
        if (price != null) setManualPrice(String(price));
      } catch {
        // 서버 액션 실패 시 정적 힌트 폴백
        const staticHint = getIngredientHint(trimmed);
        setIngredientMeta(
          staticHint
            ? {
                metaId: "",
                name: trimmed,
                prepTips: staticHint.prepTip,
                substitutes: staticHint.substitutes ?? [],
              }
            : null
        );
      } finally {
        setMatching(false);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [newName]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const price = matchResult
      ? (matchResult.effectiveSalePrice ?? matchResult.salePrice)
      : manualPrice
        ? Number(manualPrice)
        : undefined;

    onIngredientsChange([
      ...ingredients,
      {
        name: newName.trim(),
        qty: newQty,
        unit: newUnit,
        storeItemId: matchResult?.storeItemId,
        price,
      },
    ]);
    setNewName("");
    setNewQty("1");
    setManualPrice("");
    setMatchResult(null);
    setIngredientMeta(null);
    setMetaExpanded(false);
  };

  const handleRemove = (idx: number) => {
    onIngredientsChange(ingredients.filter((_, i) => i !== idx));
  };

  const hasMetaHint = Boolean(ingredientMeta?.prepTips || ingredientMeta?.substitutes?.length);

  return (
    <div className="flex flex-col gap-5" data-testid="step3-ingredients">
      {/* 재료 추가 */}
      <div>
        <p className="text-ink-700 mb-3 text-sm font-semibold">재료 목록</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="재료 이름"
              data-testid="ingredient-name-input"
              className="border-line text-ink-900 placeholder:text-ink-300 focus:border-mocha-500 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
            />
            {matching && (
              <Loader2
                size={14}
                className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 animate-spin"
              />
            )}
          </div>
          <input
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            type="number"
            min="1"
            data-testid="ingredient-qty-input"
            className="border-line text-ink-900 focus:border-mocha-500 w-14 rounded-lg border bg-white px-2 py-2 text-center text-sm outline-none"
          />
          <input
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            placeholder="단위"
            data-testid="ingredient-unit-input"
            className="border-line text-ink-900 placeholder:text-ink-300 focus:border-mocha-500 w-14 rounded-lg border bg-white px-2 py-2 text-center text-sm outline-none"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newName.trim()}
            data-testid="ingredient-add-button"
            className="bg-mocha-700 text-paper flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* AI 매칭 미리보기 */}
        {matchResult && (
          <div
            className="border-primary/20 bg-primary/5 mt-2 flex items-center gap-3 rounded-lg border p-3"
            data-testid="ingredient-match-preview"
          >
            {matchResult.thumbnailSmall && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={matchResult.thumbnailSmall}
                  alt={matchResult.itemName ?? ""}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{matchResult.itemName}</p>
              {matchResult.aiAdCopy && (
                <p className="text-muted-foreground truncate text-xs">{matchResult.aiAdCopy}</p>
              )}
            </div>
            {(matchResult.effectiveSalePrice ?? matchResult.salePrice) && (
              <p className="text-primary shrink-0 text-sm font-bold">
                {(matchResult.effectiveSalePrice ?? matchResult.salePrice)!.toLocaleString("ko-KR")}
                원
              </p>
            )}
          </div>
        )}

        {/* 재료 메타 힌트 (손질법·대체재료) 펼침 영역 */}
        {hasMetaHint && (
          <div
            className="mt-2 overflow-hidden rounded-lg border border-amber-100 bg-amber-50"
            data-testid="ingredient-meta-hint"
          >
            <button
              type="button"
              onClick={() => setMetaExpanded((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-left"
              data-testid="ingredient-meta-toggle"
            >
              <span className="text-xs font-semibold text-amber-700">
                📖 {ingredientMeta!.name} 조리 가이드
              </span>
              {metaExpanded ? (
                <ChevronUp size={14} className="text-amber-600" />
              ) : (
                <ChevronDown size={14} className="text-amber-600" />
              )}
            </button>

            {metaExpanded && (
              <div
                className="space-y-2 border-t border-amber-100 px-3 py-2"
                data-testid="ingredient-meta-content"
              >
                {ingredientMeta!.prepTips && (
                  <div>
                    <span className="text-[10px] font-semibold tracking-wide text-amber-600 uppercase">
                      ✂️ 손질법
                    </span>
                    <p className="mt-0.5 text-xs text-amber-800">{ingredientMeta!.prepTips}</p>
                  </div>
                )}
                {ingredientMeta!.substitutes && ingredientMeta!.substitutes.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold tracking-wide text-amber-600 uppercase">
                      🔄 대체 재료
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1" data-testid="ingredient-substitutes">
                      {ingredientMeta!.substitutes.map((sub) => (
                        <span
                          key={sub}
                          className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[11px] text-amber-700"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 미매칭: 수동 가격 입력 */}
        {newName && !matching && !matchResult && (
          <div className="mt-2">
            <input
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
              type="number"
              placeholder="가격 직접 입력 (선택)"
              data-testid="ingredient-manual-price"
              className="border-line text-ink-900 placeholder:text-ink-300 focus:border-mocha-500 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
            />
          </div>
        )}

        {/* 재료 목록 */}
        {ingredients.length > 0 && (
          <div
            className="border-line mt-3 overflow-hidden rounded-lg border bg-white"
            data-testid="ingredient-list"
          >
            {ingredients.map((item, idx) => (
              <div
                key={idx}
                className="border-line flex items-center gap-3 border-b px-3 py-2.5 last:border-0"
                data-testid={`ingredient-item-${idx}`}
              >
                <span className="text-ink-800 flex-1 text-sm">{item.name}</span>
                <span className="text-ink-500 text-sm">
                  {item.qty} {item.unit}
                </span>
                {item.price != null && (
                  <span className="text-primary text-xs font-medium">
                    {item.price.toLocaleString("ko-KR")}원
                  </span>
                )}
                {item.storeItemId && (
                  <span
                    className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700"
                    data-testid={`ingredient-matched-${idx}`}
                  >
                    매칭됨
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-ink-300 hover:text-terracotta"
                  data-testid={`ingredient-remove-${idx}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 예산 */}
      <div>
        <p className="text-ink-700 mb-2 text-sm font-semibold">예상 예산 (1인분 기준)</p>
        <div className="relative">
          <input
            value={budget}
            onChange={(e) => onBudgetChange(e.target.value)}
            type="number"
            placeholder="10000"
            data-testid="wizard-budget-input"
            className="border-line text-ink-900 placeholder:text-ink-300 focus:border-mocha-500 w-full rounded-lg border bg-white px-3 py-2.5 pr-8 text-sm outline-none"
          />
          <span className="text-ink-400 absolute top-1/2 right-3 -translate-y-1/2 text-sm">원</span>
        </div>
      </div>

      {/* 이미지 업로드 자리표시 */}
      <div>
        <p className="text-ink-700 mb-2 text-sm font-semibold">썸네일 이미지</p>
        <div className="border-line bg-mocha-50 flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center">
          <span className="text-mocha-400 text-2xl">📷</span>
          <p className="text-ink-400 text-xs">이미지 업로드 (Supabase Storage 연동 예정)</p>
        </div>
      </div>
    </div>
  );
}
