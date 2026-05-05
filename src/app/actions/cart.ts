"use server";

import { revalidatePath } from "next/cache";

// Phase 0 stub — Phase 4에서 Zustand cartStore 기반으로 완전 구현

export async function addToCartAction(
  _ingredientId: string,
  _cardId: number
): Promise<{ success?: boolean; error?: string }> {
  revalidatePath("/cart");
  return { error: "NOT_IMPLEMENTED" };
}

export async function removeCartItemAction(
  _id: string
): Promise<{ success?: boolean; error?: string }> {
  revalidatePath("/cart");
  return { success: true };
}
