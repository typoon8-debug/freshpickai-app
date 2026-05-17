"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/family/invite-code";
import type { FamilyGroup, FamilyMember } from "@/lib/types";

export async function createFamilyGroup(name: string): Promise<FamilyGroup | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const inviteCode = generateInviteCode();

  // fp_family_group에 user_id 컬럼 없어 RLS INSERT 차단 → admin client
  const { data: group, error: groupError } = await admin
    .from("fp_family_group")
    .insert({ name, invite_code: inviteCode })
    .select()
    .single();

  if (groupError || !group) return null;

  // fp_family_member INSERT — admin으로 FK/RLS 우회
  const { error: memberError } = await admin.from("fp_family_member").insert({
    group_id: group.group_id,
    user_id: user.id,
  });

  if (memberError) {
    await admin.from("fp_family_group").delete().eq("group_id", group.group_id);
    return null;
  }

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

  // fp_family_member SELECT RLS가 순환 정책일 수 있어 admin client 사용
  const admin = createAdminClient();

  const { data: member } = await admin
    .from("fp_family_member")
    .select("group_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!member) return null;

  const { data: group } = await admin
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

export async function removeFamilyMember(
  memberId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };

  const admin = createAdminClient();

  const { data: myMembership } = await admin
    .from("fp_family_member")
    .select("group_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!myMembership) return { ok: false, error: "NOT_IN_FAMILY" };

  const { data: target } = await admin
    .from("fp_family_member")
    .select("group_id, user_id")
    .eq("member_id", memberId)
    .maybeSingle();

  if (!target) return { ok: false, error: "MEMBER_NOT_FOUND" };
  if (target.group_id !== myMembership.group_id) return { ok: false, error: "FORBIDDEN" };

  // 삭제는 본인 확인 후 admin으로 수행
  const { error } = await admin.from("fp_family_member").delete().eq("member_id", memberId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();

  const { data: myMembership } = await admin
    .from("fp_family_member")
    .select("group_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!myMembership) return [];

  const { data: members } = await admin
    .from("fp_family_member")
    .select("*")
    .eq("group_id", myMembership.group_id)
    .order("joined_at");

  if (!members || members.length === 0) return [];

  const userIds = members.map((m) => m.user_id);
  const { data: profiles } = await admin.from("fp_user_profile").select("*").in("user_id", userIds);

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

export type FamilyStats = {
  mealsThisMonth: number;
  level: number;
};

/** 이번 달 가족 주문 수(함께한 식사) + 평균 레벨 조회 */
export async function getFamilyStatsAction(): Promise<FamilyStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { mealsThisMonth: 0, level: 1 };

  const admin = createAdminClient();

  const { data: myMembership } = await admin
    .from("fp_family_member")
    .select("group_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!myMembership) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count } = await admin
      .from("fp_order")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStart);

    const { data: myProfile } = await admin
      .from("fp_user_profile")
      .select("level")
      .eq("user_id", user.id)
      .single();

    return { mealsThisMonth: count ?? 0, level: myProfile?.level ?? 1 };
  }

  const { data: allMembers } = await admin
    .from("fp_family_member")
    .select("user_id")
    .eq("group_id", myMembership.group_id);

  const memberIds = (allMembers ?? []).map((m) => m.user_id);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [orderRes, profileRes] = await Promise.all([
    admin
      .from("fp_order")
      .select("*", { count: "exact", head: true })
      .in("user_id", memberIds)
      .gte("created_at", monthStart),
    admin.from("fp_user_profile").select("level").in("user_id", memberIds),
  ]);

  const levels = (profileRes.data ?? []).map((p) => p.level ?? 1);
  const avgLevel =
    levels.length > 0 ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length) : 1;

  return {
    mealsThisMonth: orderRes.count ?? 0,
    level: avgLevel,
  };
}
