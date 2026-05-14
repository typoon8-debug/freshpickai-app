"use client";

import { useState } from "react";
import type { IngredientMeta } from "@/lib/types";

interface IngredientMetaBlockProps {
  metas?: IngredientMeta[];
}

export function IngredientMetaBlock({ metas = [] }: IngredientMetaBlockProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (metas.length === 0) {
    return (
      <section
        data-testid="ingredient-meta-block-empty"
        className="rounded-xl border border-dashed border-olive-500/40 bg-olive-100/30 p-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🌿</span>
          <div>
            <p className="text-sm font-semibold text-olive-700">재료 정보</p>
            <p className="text-ink-400 text-xs">손질법·계량 힌트·대체 재료 정보를 준비 중입니다.</p>
          </div>
        </div>
      </section>
    );
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section
      data-testid="ingredient-meta-block"
      className="rounded-xl border border-olive-500/30 bg-olive-100/20 p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🌿</span>
        <h3 className="text-sm font-semibold text-olive-700">재료 정보</h3>
        <span className="rounded-full bg-olive-200 px-2 py-0.5 text-xs font-medium text-olive-700">
          {metas.length}종
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {metas.map((meta) => {
          const isExpanded = expandedIds.has(meta.metaId);
          const hasDetails = meta.prepTips || meta.measurementHints || meta.substitutes.length > 0;

          return (
            <div
              key={meta.metaId}
              data-testid="ingredient-meta-item"
              className="border-line overflow-hidden rounded-lg border bg-white"
            >
              <button
                type="button"
                onClick={() => hasDetails && toggleExpand(meta.metaId)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                aria-expanded={isExpanded}
                disabled={!hasDetails}
              >
                <span className="text-ink-900 text-sm font-medium">{meta.name}</span>
                {hasDetails && (
                  <span
                    className="text-ink-400 text-xs transition-transform duration-200"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "none" }}
                  >
                    ▾
                  </span>
                )}
              </button>

              {isExpanded && hasDetails && (
                <div className="border-t border-olive-100 px-3 pt-2 pb-3">
                  {meta.prepTips && (
                    <div className="mb-2">
                      <p className="mb-0.5 text-xs font-semibold text-olive-700">✂️ 손질법</p>
                      <p className="text-ink-500 text-xs leading-relaxed">{meta.prepTips}</p>
                    </div>
                  )}
                  {meta.measurementHints && (
                    <div className="mb-2">
                      <p className="mb-0.5 text-xs font-semibold text-olive-700">⚖️ 계량 힌트</p>
                      <p className="text-ink-500 text-xs leading-relaxed">
                        {meta.measurementHints}
                      </p>
                    </div>
                  )}
                  {meta.substitutes.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-semibold text-olive-700">🔄 대체 재료</p>
                      <div className="flex flex-wrap gap-1.5">
                        {meta.substitutes.map((sub) => (
                          <span
                            key={sub}
                            data-testid="substitute-chip"
                            className="rounded-full border border-olive-300 bg-olive-50 px-2.5 py-0.5 text-xs text-olive-700"
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
          );
        })}
      </div>
    </section>
  );
}
