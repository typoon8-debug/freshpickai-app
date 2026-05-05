"use server";

import { revalidatePath } from "next/cache";

// Phase 0 stub — Phase 3에서 완전 구현 (geocodeAddress 포함)

export interface AddressInput {
  address: string;
  addrDetail?: string;
  label?: string;
  isDefault?: boolean;
}

export async function addAddressAction(
  _input: AddressInput
): Promise<{ success?: boolean; error?: string }> {
  revalidatePath("/mypage");
  return { error: "NOT_IMPLEMENTED" };
}

export async function updateAddressAction(
  _id: string,
  _input: Partial<AddressInput>
): Promise<{ success?: boolean; error?: string }> {
  revalidatePath("/mypage");
  return { error: "NOT_IMPLEMENTED" };
}

export async function deleteAddressAction(
  _id: string
): Promise<{ success?: boolean; error?: string }> {
  revalidatePath("/mypage");
  return { success: true };
}
