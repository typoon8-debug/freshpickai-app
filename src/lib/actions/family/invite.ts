"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isValidInviteCode } from "@/lib/family/invite-code";
import type { RelationshipType } from "@/lib/constants/relationship";

export type JoinInviteError =
  | "AUTH_REQUIRED"
  | "CODE_INVALID"
  | "CODE_EXPIRED"
  | "CODE_EXHAUSTED"
  | "JOIN_FAILED";

export type JoinInviteResult =
  | { success: true; groupId: string; alreadyMember: boolean }
  | { success: false; error: JoinInviteError; redirectTo?: string };

/** 초대 코드로 가족 그룹에 합류. relationship은 초대 수락 UI에서 선택한 값. */
export async function joinFamilyByInvite(
  code: string,
  relationship: RelationshipType = "other"
): Promise<JoinInviteResult> {
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

  // fp_family_group/member SELECT & INSERT 모두 admin으로 RLS 우회
  const admin = createAdminClient();

  const { data: group } = await admin
    .from("fp_family_group")
    .select("group_id")
    .eq("invite_code", normalized)
    .single();

  if (!group) {
    return { success: false, error: "CODE_INVALID" };
  }

  const { data: existing } = await admin
    .from("fp_family_member")
    .select("member_id")
    .eq("group_id", group.group_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { success: true, groupId: group.group_id, alreadyMember: true };
  }

  const { error: insertError } = await admin
    .from("fp_family_member")
    .insert({ group_id: group.group_id, user_id: user.id, relationship });

  if (insertError) {
    return { success: false, error: "JOIN_FAILED" };
  }

  return { success: true, groupId: group.group_id, alreadyMember: false };
}
