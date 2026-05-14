"use server";

import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/family/invite-code";
import type { FamilyGroup, FamilyMember } from "@/lib/types";

export async function createFamilyGroup(name: string): Promise<FamilyGroup | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const inviteCode = generateInviteCode();

  const { data: group, error: groupError } = await supabase
    .from("fp_family_group")
    .insert({ name, invite_code: inviteCode })
    .select()
    .single();

  if (groupError || !group) return null;

  await supabase.from("fp_family_member").insert({
    group_id: group.group_id,
    user_id: user.id,
  });

  return {
    groupId: group.group_id,
    name: group.name,
    inviteCode: group.invite_code,
    createdAt: group.created_at,
  };
}

export async function getFamilyGroup(): Promise<FamilyGroup | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("fp_family_member")
    .select("group_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .single();

  if (!member) return null;

  const { data: group } = await supabase
    .from("fp_family_group")
    .select("*")
    .eq("group_id", member.group_id)
    .single();

  if (!group) return null;

  return {
    groupId: group.group_id,
    name: group.name,
    inviteCode: group.invite_code,
    createdAt: group.created_at,
  };
}

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: myMembership } = await supabase
    .from("fp_family_member")
    .select("group_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .single();

  if (!myMembership) return [];

  const { data: members } = await supabase
    .from("fp_family_member")
    .select("*")
    .eq("group_id", myMembership.group_id)
    .order("joined_at");

  if (!members || members.length === 0) return [];

  const userIds = members.map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from("fp_user_profile")
    .select("*")
    .in("user_id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return members.map((m) => {
    const profile = profileMap.get(m.user_id);
    return {
      memberId: m.member_id,
      groupId: m.group_id,
      userId: m.user_id,
      displayName: profile?.display_name ?? "멤버",
      avatarUrl: profile?.avatar_url ?? undefined,
      familyRole: (profile?.family_role ?? "parent") as FamilyMember["familyRole"],
      level: profile?.level ?? 1,
      online: false,
      todayActivity: "",
      joinedAt: m.joined_at,
    };
  });
}
