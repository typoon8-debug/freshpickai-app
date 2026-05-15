import type { CardTheme } from "@/lib/types";

/** 카드 목록 필터 — qk.cards() 캐시 키 구성요소 */
export type CardQueryFilter = {
  theme?: CardTheme;
  category?: "meal" | "snack" | "cinema";
  officialOnly?: boolean;
  aiTags?: string[];
};

/**
 * TanStack Query 쿼리키 팩토리
 * 필터 조합별로 독립 캐시 슬롯 생성 — JSON.stringify 직렬화 없이 구조화된 키 사용
 */
export const qk = {
  // 카드 목록: 필터 조합별 독립 캐시 (theme·category·officialOnly·aiTags 각각 분리)
  cards: (filter?: CardQueryFilter) =>
    [
      "cards",
      filter?.theme ?? null,
      filter?.category ?? null,
      filter?.officialOnly ?? false,
      filter?.aiTags ?? [],
    ] as const,

  // 카드 상세
  card: (id: string | number) => ["card", String(id)] as const,

  // 데일리픽 (하루 단위 캐시)
  daily: () => ["daily"] as const,

  // 가족 그룹
  family: (groupId?: string) => ["family", groupId ?? null] as const,

  // 장바구니
  cart: () => ["cart"] as const,

  // 쇼핑 메모
  memos: () => ["memos"] as const,

  // 가족 투표 세션
  voteSession: (sessionId: string) => ["vote", sessionId] as const,
} as const;
