"use server";

import { createClient } from "@/lib/supabase/server";
import { isValidInviteCode } from "@/lib/family/invite-code";

export type JoinInviteError =
  | "AUTH_REQUIRED"
  | "CODE_INVALID"
  | "CODE_EXPIRED"
  | "CODE_EXHAUSTED"
  | "JOIN_FAILED";

export type JoinInviteResult =
  | { success: true; groupId: string; alreadyMember: boolean }
  | { success: false; error: JoinInviteError; redirectTo?: string };

export async function joinFamilyByInvite(code: string): Promise<JoinInviteResult> {
  const normalized = code.trim().toUpperCase();

  if (!isValidInviteCode(normalized)) {
    return { success: false, error: "CODE_INVALID" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "AUTH_REQUIRED" };
  }

  const { data: group } = await supabase
    .from("fp_family_group")
    .select("group_id")
    .eq("invite_code", normalized)
    .single();

  if (!group) {
    return { success: false, error: "CODE_INVALID" };
  }

  const { data: existing } = await supabase
    .from("fp_family_member")
    .select("member_id")
    .eq("group_id", group.group_id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return { success: true, groupId: group.group_id, alreadyMember: true };
  }

  const { error: insertError } = await supabase
    .from("fp_family_member")
    .insert({ group_id: group.group_id, user_id: user.id });

  if (insertError) {
    return { success: false, error: "JOIN_FAILED" };
  }

  return { success: true, groupId: group.group_id, alreadyMember: false };
}
