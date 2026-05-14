import { z } from "zod";

export const RECOMMENDATION_THEMES = [
  "오늘의한끼",
  "지금이적기",
  "놓치면아까워요",
  "다시만나볼까요",
  "새로들어왔어요",
] as const;

export type RecommendationThemeName = (typeof RECOMMENDATION_THEMES)[number];

export const RecommendedCardSchema = z.object({
  cardId: z.string(),
  title: z.string(),
  reason: z.string(),
  confidence: z.number().min(0).max(1),
  promoHighlight: z.string().optional(),
  discountPct: z.number().optional(),
});

export const RecommendationSchema = z.object({
  theme: z.enum(RECOMMENDATION_THEMES),
  cards: z.array(RecommendedCardSchema).min(1).max(5),
});

export const RecommendResponseSchema = z.object({
  recommendations: z.array(RecommendationSchema).min(1).max(5),
});

export type RecommendedCard = z.infer<typeof RecommendedCardSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type RecommendResponse = z.infer<typeof RecommendResponseSchema>;
