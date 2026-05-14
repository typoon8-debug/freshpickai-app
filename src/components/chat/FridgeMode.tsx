"use client";

import { useState, useTransition } from "react";
import { X, Plus, Search, ChefHat, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface MatchedCard {
  cardId: string;
  name: string;
  emoji?: string;
  description?: string;
  coverImage?: string;
  matchScore?: number;
}

interface FridgeModeProps {
  onClose: () => void;
}

const INGREDIENT_SUGGESTIONS = [
  "달걀",
  "양파",
  "대파",
  "마늘",
  "감자",
  "당근",
  "두부",
  "돼지고기",
  "닭고기",
  "소고기",
  "고추",
  "김치",
  "시금치",
  "버섯",
  "애호박",
];

export function FridgeMode({ onClose }: FridgeModeProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [matchedCards, setMatchedCards] = useState<MatchedCard[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const addIngredient = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || ingredients.includes(trimmed)) return;
    setIngredients((prev) => [...prev, trimmed]);
    setInputValue("");
    setSearched(false);
  };

  const removeIngredient = (name: string) => {
    setIngredients((prev) => prev.filter((i) => i !== name));
    setSearched(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && ingredients.length > 0) {
      setIngredients((prev) => prev.slice(0, -1));
    }
  };

  const handleSearch = () => {
    if (ingredients.length === 0) {
      toast.error("재료를 1개 이상 입력해 주세요.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/fridge-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients }),
        });
        if (!res.ok) throw new Error("매칭 실패");
        const json = (await res.json()) as { cards: MatchedCard[] };
        setMatchedCards(json.cards ?? []);
        setSearched(true);
      } catch {
        toast.error("카드 매칭 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-line flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧊</span>
          <div>
            <p className="text-ink-900 text-sm font-semibold">냉장고 비우기</p>
            <p className="text-ink-400 text-xs">있는 재료로 만들 수 있는 메뉴를 찾아드려요</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-ink-400 hover:text-ink-700 flex h-8 w-8 items-center justify-center rounded-full"
          aria-label="닫기"
        >
          <X size={18} />
        </button>
      </div>

      {/* 재료 입력 */}
      <div className="border-line space-y-3 border-b p-4">
        <div className="border-mocha-200 flex min-h-[48px] flex-wrap items-center gap-1.5 rounded-xl border bg-white px-3 py-2">
          {ingredients.map((ing) => (
            <span
              key={ing}
              className="bg-mocha-100 text-mocha-800 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            >
              {ing}
              <button
                type="button"
                onClick={() => removeIngredient(ing)}
                aria-label={`${ing} 삭제`}
                className="text-mocha-500 hover:text-mocha-900"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={ingredients.length === 0 ? "재료를 입력하세요 (Enter로 추가)" : ""}
            className="text-ink-800 placeholder:text-ink-300 min-w-[100px] flex-1 bg-transparent text-sm outline-none"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => addIngredient(inputValue)}
              className="bg-mocha-700 text-paper flex h-6 w-6 items-center justify-center rounded-full"
              aria-label="추가"
            >
              <Plus size={12} />
            </button>
          )}
        </div>

        {/* 자주 사용하는 재료 */}
        <div className="flex flex-wrap gap-1.5">
          {INGREDIENT_SUGGESTIONS.filter((s) => !ingredients.includes(s))
            .slice(0, 8)
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addIngredient(s)}
                className="bg-mocha-50 text-mocha-700 hover:bg-mocha-100 rounded-full px-2.5 py-1 text-xs transition"
              >
                + {s}
              </button>
            ))}
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={isPending || ingredients.length === 0}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition",
            ingredients.length > 0
              ? "bg-mocha-700 text-paper hover:bg-mocha-900"
              : "bg-mocha-100 text-mocha-400 cursor-not-allowed"
          )}
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              AI가 카드를 찾는 중...
            </>
          ) : (
            <>
              <Search size={16} />
              {ingredients.length}가지 재료로 카드 찾기
            </>
          )}
        </button>
      </div>

      {/* 매칭 결과 */}
      <div className="flex-1 overflow-y-auto p-4">
        {searched && matchedCards.length === 0 && (
          <div className="text-ink-400 py-10 text-center text-sm">
            <ChefHat size={32} className="text-mocha-200 mx-auto mb-3" />
            <p>매칭되는 카드가 없어요.</p>
            <p className="mt-1 text-xs">다른 재료를 추가해보세요.</p>
          </div>
        )}

        {matchedCards.length > 0 && (
          <div className="space-y-3">
            <p className="text-ink-500 text-xs font-medium">
              {matchedCards.length}개의 카드를 찾았어요
            </p>
            {matchedCards.map((card) => (
              <Link
                key={card.cardId}
                href={`/cards/${card.cardId}`}
                onClick={onClose}
                className="border-mocha-100 hover:border-mocha-300 flex items-center gap-3 rounded-2xl border bg-white p-3 transition"
              >
                {/* 썸네일 또는 이모지 */}
                <div className="border-mocha-100 bg-mocha-50 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
                  {card.coverImage ? (
                    <Image
                      src={card.coverImage}
                      alt={card.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{card.emoji ?? "🍽️"}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-ink-900 truncate text-sm font-semibold">{card.name}</p>
                  {card.description && (
                    <p className="text-ink-400 mt-0.5 truncate text-xs">{card.description}</p>
                  )}
                  {card.matchScore !== undefined && (
                    <div className="mt-1 flex items-center gap-1">
                      <div className="bg-mocha-100 h-1 flex-1 overflow-hidden rounded-full">
                        <div
                          className="bg-mocha-600 h-full rounded-full"
                          style={{ width: `${Math.round(card.matchScore * 100)}%` }}
                        />
                      </div>
                      <span className="text-mocha-600 text-[10px] font-medium">
                        {Math.round(card.matchScore * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <ArrowRight size={16} className="text-ink-300 shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {!searched && ingredients.length === 0 && (
          <div className="text-ink-400 py-10 text-center text-sm">
            <span className="text-4xl">🥬</span>
            <p className="mt-3">냉장고에 있는 재료를 입력하면</p>
            <p className="mt-1">AI가 만들 수 있는 메뉴를 추천해 드려요</p>
          </div>
        )}
      </div>
    </div>
  );
}
