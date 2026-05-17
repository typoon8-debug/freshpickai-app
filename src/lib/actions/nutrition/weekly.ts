"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type DayNutrition = {
  date: string; // YYYY-MM-DD
  kcal: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber: number; // g
  sodium: number; // mg
  sugar: number; // g
};

export type WeeklyNutritionSummary = {
  days: DayNutrition[];
  weekLabel: string; // ex: "2026년 5월 3주"
  prevWeekDelta: {
    kcal: number; // %
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  topCards: { cardId: string; cardName: string; totalKcal: number }[];
  dailyGoal: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

function weekStart(offset: number): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function weekLabel(start: Date): string {
  const year = start.getFullYear();
  const month = start.getMonth() + 1;
  const week = Math.ceil(start.getDate() / 7);
  return `${year}년 ${month}월 ${week}주`;
}

type OrderItemRow = {
  order_id: string;
  fp_order: { created_at: string; fp_menu_card: { card_id: string; name: string } | null } | null;
  fp_dish_ingredient: {
    estimated_calories: number | null;
    qty_value: number | null;
    v_store_inventory_item: {
      ai_calories: number | null;
      ai_nutrition_summary: Record<string, number> | null;
    } | null;
  } | null;
};

function extractNutrition(row: OrderItemRow["fp_dish_ingredient"]): DayNutrition & { date: "" } {
  const qty = row?.qty_value ?? 1;
  const base = (row?.v_store_inventory_item?.ai_calories ?? row?.estimated_calories ?? 0) * qty;

  const ns = row?.v_store_inventory_item?.ai_nutrition_summary;
  return {
    date: "",
    kcal: base,
    protein: ((ns?.protein ?? 0) as number) * qty,
    carbs: ((ns?.carbs ?? 0) as number) * qty,
    fat: ((ns?.fat ?? 0) as number) * qty,
    fiber: ((ns?.fiber ?? 0) as number) * qty,
    sodium: ((ns?.sodium ?? 0) as number) * qty,
    sugar: ((ns?.sugar ?? 0) as number) * qty,
  };
}

export async function getWeeklyNutritionSummary(
  weekOffset = 0
): Promise<WeeklyNutritionSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const start = weekStart(weekOffset);
  const end = weekStart(weekOffset + 1);

  const { data: orders } = await admin
    .from("fp_order")
    .select(
      `
      order_id,
      created_at,
      fp_order_item (
        fp_dish_ingredient (
          estimated_calories,
          qty_value,
          v_store_inventory_item (
            ai_calories,
            ai_nutrition_summary
          )
        )
      ),
      fp_menu_card (
        card_id,
        name
      )
    `
    )
    .eq("customer_id", user.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .in("status", ["paid", "delivered", "confirmed"]);

  // 일별 집계 맵 초기화
  const dayMap: Record<string, DayNutrition> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = fmt(d);
    dayMap[key] = {
      date: key,
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      sugar: 0,
    };
  }

  // 카드별 kcal 집계
  const cardMap: Record<string, { cardId: string; cardName: string; totalKcal: number }> = {};

  type OrderRow = {
    order_id: string;
    created_at: string;
    fp_order_item: {
      fp_dish_ingredient: {
        estimated_calories: number | null;
        qty_value: number | null;
        v_store_inventory_item: {
          ai_calories: number | null;
          ai_nutrition_summary: Record<string, number> | null;
        } | null;
      } | null;
    }[];
    fp_menu_card: { card_id: string; name: string } | null;
  };

  for (const order of (orders ?? []) as unknown as OrderRow[]) {
    const dateKey = fmt(new Date(order.created_at));
    if (!dayMap[dateKey]) continue;

    const card = order.fp_menu_card;
    for (const oi of order.fp_order_item ?? []) {
      const n = extractNutrition(oi.fp_dish_ingredient as OrderItemRow["fp_dish_ingredient"]);
      dayMap[dateKey].kcal += n.kcal;
      dayMap[dateKey].protein += n.protein;
      dayMap[dateKey].carbs += n.carbs;
      dayMap[dateKey].fat += n.fat;
      dayMap[dateKey].fiber += n.fiber;
      dayMap[dateKey].sodium += n.sodium;
      dayMap[dateKey].sugar += n.sugar;

      if (card) {
        if (!cardMap[card.card_id])
          cardMap[card.card_id] = { cardId: card.card_id, cardName: card.name, totalKcal: 0 };
        cardMap[card.card_id].totalKcal += n.kcal;
      }
    }
  }

  // 전주 데이터 (delta 계산용)
  let prevWeekDelta: WeeklyNutritionSummary["prevWeekDelta"] = null;
  if (weekOffset === 0) {
    const prevSummary = await getWeeklyNutritionSummary(-1);
    if (prevSummary) {
      const thisTotal = Object.values(dayMap).reduce(
        (acc, d) => ({
          kcal: acc.kcal + d.kcal,
          protein: acc.protein + d.protein,
          carbs: acc.carbs + d.carbs,
          fat: acc.fat + d.fat,
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      );
      const prevTotal = prevSummary.days.reduce(
        (acc, d) => ({
          kcal: acc.kcal + d.kcal,
          protein: acc.protein + d.protein,
          carbs: acc.carbs + d.carbs,
          fat: acc.fat + d.fat,
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      );
      const calcDelta = (cur: number, prev: number) =>
        prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 100);
      prevWeekDelta = {
        kcal: calcDelta(thisTotal.kcal, prevTotal.kcal),
        protein: calcDelta(thisTotal.protein, prevTotal.protein),
        carbs: calcDelta(thisTotal.carbs, prevTotal.carbs),
        fat: calcDelta(thisTotal.fat, prevTotal.fat),
      };
    }
  }

  // 사용자 선호도 기반 일일 목표
  const { data: pref } = await supabase
    .from("fp_user_preference")
    .select("wellness_goals, dietary_tags")
    .eq("user_id", user.id)
    .single();

  const isLowCal =
    pref?.wellness_goals?.includes("다이어트") || pref?.dietary_tags?.includes("저칼로리");
  const isHighProtein =
    pref?.wellness_goals?.includes("근육증가") || pref?.dietary_tags?.includes("고단백");

  const dailyGoal = {
    kcal: isLowCal ? 1600 : 2000,
    protein: isHighProtein ? 120 : 65,
    carbs: isLowCal ? 200 : 250,
    fat: isLowCal ? 44 : 55,
  };

  const topCards = Object.values(cardMap)
    .sort((a, b) => b.totalKcal - a.totalKcal)
    .slice(0, 3);

  return {
    days: Object.values(dayMap),
    weekLabel: weekLabel(start),
    prevWeekDelta,
    topCards,
    dailyGoal,
  };
}
