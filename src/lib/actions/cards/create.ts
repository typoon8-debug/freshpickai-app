"use server";

import { createClient } from "@/lib/supabase/server";
import { updateTag } from "next/cache";
import type { CardTheme } from "@/lib/types";
import type { CardWizardValues } from "@/lib/validations/card-wizard";

function deriveCategory(theme: CardTheme): "meal" | "snack" | "cinema" {
  if (theme === "snack_pack") return "snack";
  if (theme === "cinema_night") return "cinema";
  return "meal";
}

/** 카드 만들기 위자드 결과를 fp_menu_card에 저장 */
export async function createCardAction(
  values: CardWizardValues
): Promise<{ cardId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const name = values.tags.slice(0, 2).join(" · ") || values.theme;
  const category = deriveCategory(values.theme);
  const budgetLabel = Number(values.budget).toLocaleString("ko-KR");
  const description = `예산: ${budgetLabel}원 | 태그: ${values.tags.join(", ")}`;

  const { data, error } = await supabase
    .from("fp_menu_card")
    .insert({
      owner_user_id: user.id,
      card_theme: values.theme,
      name,
      category,
      description,
      is_official: false,
      is_new: true,
      review_status: "private",
    })
    .select("card_id")
    .single();

  if (error || !data) return { error: error?.message ?? "카드 생성 실패" };

  const cardId = (data as Record<string, unknown>).card_id as string;
  updateTag("cards");
  return { cardId };
}
