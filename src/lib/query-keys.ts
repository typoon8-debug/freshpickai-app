/** TanStack Query 쿼리키 팩토리 */
export const qk = {
  cards: (filter?: string) => ["cards", filter] as const,
  card: (id: string | number) => ["card", id] as const,
  daily: () => ["daily"] as const,
  family: (groupId?: string) => ["family", groupId] as const,
  cart: () => ["cart"] as const,
  memos: () => ["memos"] as const,
} as const;
