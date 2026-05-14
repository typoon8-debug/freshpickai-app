import { z } from "zod";
import type { CardTheme } from "@/lib/types";

export const CARD_THEMES = [
  "chef_table",
  "one_meal",
  "family_recipe",
  "drama_recipe",
  "honwell",
  "seasonal",
  "global_plate",
  "k_dessert",
  "snack_pack",
  "cinema_night",
] as const satisfies readonly CardTheme[];

export const ingredientEntrySchema = z.object({
  name: z.string().min(1, "재료 이름을 입력하세요"),
  qty: z.string().min(1),
  unit: z.string().min(1),
  storeItemId: z.string().optional(),
  price: z.number().optional(),
});

export const cardWizardSchema = z.object({
  theme: z.enum(CARD_THEMES),
  tags: z.array(z.string()).min(3, "취향 태그를 최소 3개 선택해 주세요"),
  ingredients: z.array(ingredientEntrySchema).min(1, "재료를 1개 이상 추가해 주세요"),
  budget: z
    .string()
    .min(1, "예상 예산을 입력하세요")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "올바른 금액을 입력하세요"),
  cardName: z.string().optional(),
  coverImageUrl: z.string().optional(),
  submitForReview: z.boolean(),
  aiConsent: z.boolean(),
});

export type CardWizardValues = z.infer<typeof cardWizardSchema>;
