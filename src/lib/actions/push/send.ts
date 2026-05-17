"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getFirebaseMessaging } from "./firebase";

type MulticastPayload = {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  link?: string;
};

// ── 내부 멀티캐스트 발송 ──────────────────────────────────────
async function sendMulticast({ tokens, title, body, data, link }: MulticastPayload) {
  if (tokens.length === 0) return;

  const messaging = getFirebaseMessaging();
  await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: { ...data, link: link ?? "/" },
    webpush: {
      notification: {
        title,
        body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
      },
      fcmOptions: { link: link ?? "/" },
    },
  });
}

// ── 가족 구성원 FCM 토큰 일괄 조회 ───────────────────────────
async function getGroupFcmTokens(groupId: string, memberIds?: string[]): Promise<string[]> {
  const admin = createAdminClient();

  // 대상 user_id 목록: 지정 없으면 그룹 전원
  let targetUserIds: string[];
  if (memberIds && memberIds.length > 0) {
    targetUserIds = memberIds;
  } else {
    const { data: members } = await admin
      .from("fp_family_member")
      .select("user_id")
      .eq("group_id", groupId);
    targetUserIds = (members ?? []).map((m) => m.user_id);
  }

  if (targetUserIds.length === 0) return [];

  // 알림 설정 + fcm_token 함께 조회
  const { data: profiles } = await admin
    .from("fp_user_profile")
    .select("user_id, fcm_token")
    .in("user_id", targetUserIds)
    .not("fcm_token", "is", null);

  const userIds = (profiles ?? []).map((p) => p.user_id);
  if (userIds.length === 0) return [];

  // vote_notify가 false인 사용자 제외
  const { data: settings } = await admin
    .from("fp_user_notification_settings")
    .select("user_id, vote_notify")
    .in("user_id", userIds)
    .eq("vote_notify", false);

  const blockedIds = new Set((settings ?? []).map((s) => s.user_id));

  return (profiles ?? [])
    .filter((p) => p.fcm_token && !blockedIds.has(p.user_id))
    .map((p) => p.fcm_token as string);
}

async function getMemberFcmTokens(
  userIds: string[],
  notifyKey: "vote_notify" | "movie_night_notify" | "delivery_notify" = "vote_notify"
): Promise<string[]> {
  if (userIds.length === 0) return [];
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("fp_user_profile")
    .select("user_id, fcm_token")
    .in("user_id", userIds)
    .not("fcm_token", "is", null);

  const foundIds = (profiles ?? []).map((p) => p.user_id);
  if (foundIds.length === 0) return [];

  const { data: settings } = await admin
    .from("fp_user_notification_settings")
    .select(`user_id, ${notifyKey}`)
    .in("user_id", foundIds)
    .eq(notifyKey, false);

  const blockedIds = new Set((settings ?? []).map((s) => s.user_id));

  return (profiles ?? [])
    .filter((p) => p.fcm_token && !blockedIds.has(p.user_id))
    .map((p) => p.fcm_token as string);
}

// ── 투표 안건 생성 알림 ───────────────────────────────────────
export async function sendPollCreatedNotification(input: {
  groupId: string;
  pollId: string;
  creatorName: string;
  pollTitle: string;
  targetMemberIds?: string[];
}) {
  const tokens = await getGroupFcmTokens(input.groupId, input.targetMemberIds);
  await sendMulticast({
    tokens,
    title: `${input.creatorName}님이 투표를 만들었어요 🗳`,
    body: input.pollTitle,
    data: { type: "poll", pollId: input.pollId },
    link: `/family?tab=poll&id=${input.pollId}`,
  });
}

// ── 무비나이트 카드 생성 완료 알림 ───────────────────────────
export async function sendMovieNightNotification(input: {
  groupId: string;
  cardTitle: string;
  cardId: string;
}) {
  const admin = createAdminClient();
  const { data: members } = await admin
    .from("fp_family_member")
    .select("user_id")
    .eq("group_id", input.groupId);
  const userIds = (members ?? []).map((m) => m.user_id);
  const tokens = await getMemberFcmTokens(userIds, "movie_night_notify");

  await sendMulticast({
    tokens,
    title: "🎬 무비나이트 메뉴 완성!",
    body: `오늘 밤 [${input.cardTitle}] 어때요?`,
    data: { type: "movie_night", cardId: input.cardId },
    link: `/cards/${input.cardId}`,
  });
}

// ── 배송 상태 알림 (단일 사용자) ─────────────────────────────
export async function sendDeliveryNotification(input: {
  token: string;
  title: string;
  body: string;
  fpOrderId: string;
}) {
  const messaging = getFirebaseMessaging();
  await messaging.send({
    token: input.token,
    notification: { title: input.title, body: input.body },
    data: { type: "delivery", fpOrderId: input.fpOrderId, link: `/profile/orders` },
    webpush: {
      notification: {
        title: input.title,
        body: input.body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
      },
      fcmOptions: { link: `/profile/orders` },
    },
  });
}

// ── 미투표 독려 알림 ──────────────────────────────────────────
export async function sendVoteReminderNotification(input: {
  pollId: string;
  pollTitle: string;
  pendingMemberIds: string[];
}) {
  const tokens = await getMemberFcmTokens(input.pendingMemberIds, "vote_notify");
  await sendMulticast({
    tokens,
    title: "⏰ 아직 투표 안 하셨나요?",
    body: `마감 임박! "${input.pollTitle}"`,
    data: { type: "poll_reminder", pollId: input.pollId },
    link: `/family?tab=poll&id=${input.pollId}`,
  });
}
