"use client";

// Kakao JavaScript SDK v2.7+ 타입 정의 (필요한 부분만 narrow)
interface KakaoShareLink {
  mobileWebUrl: string;
  webUrl: string;
}

interface KakaoFeedContent {
  title: string;
  description: string;
  imageUrl: string;
  link: KakaoShareLink;
}

interface KakaoShareButton {
  title: string;
  link: KakaoShareLink;
}

interface KakaoShareDefaultParams {
  objectType: "feed";
  content: KakaoFeedContent;
  buttons?: KakaoShareButton[];
  serverCallbackArgs?: Record<string, string>;
}

interface KakaoSDK {
  init(key: string): void;
  isInitialized(): boolean;
  Share: {
    sendDefault(params: KakaoShareDefaultParams): void;
    sendCustom(params: KakaoShareDefaultParams): void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

export function initKakao(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.Kakao) return false;
  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!key) return false;
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(key);
  }
  return true;
}

export function isKakaoShareReady(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.Kakao?.isInitialized()) && Boolean(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
}

interface ShareFamilyInviteParams {
  inviteCode: string;
  inviteUrl: string;
  groupName: string;
  inviterName: string;
  imageUrl?: string;
}

export function shareFamilyInvite(params: ShareFamilyInviteParams): boolean {
  if (!initKakao()) return false;
  if (!window.Kakao) return false;

  const link: KakaoShareLink = {
    mobileWebUrl: params.inviteUrl,
    webUrl: params.inviteUrl,
  };

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: `${params.inviterName}님이 ${params.groupName} 보드에 초대했어요 🍽️`,
      description: `초대코드: ${params.inviteCode}\n오늘 우리 뭐 먹을지 함께 결정해요!`,
      imageUrl: params.imageUrl ?? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/og/family-invite.png`,
      link,
    },
    buttons: [{ title: "초대 수락하기", link }],
    serverCallbackArgs: { invite_code: params.inviteCode },
  });

  return true;
}

interface ShareCardParams {
  cardId: string;
  cardName: string;
  cardEmoji?: string;
  cardDescription?: string;
  imageUrl?: string;
}

export function shareCard(params: ShareCardParams): boolean {
  if (!initKakao()) return false;
  if (!window.Kakao) return false;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
  const previewUrl = `${appUrl}/cards/${params.cardId}/preview`;
  const link: KakaoShareLink = {
    mobileWebUrl: previewUrl,
    webUrl: previewUrl,
  };

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: `${params.cardEmoji ?? "🍽️"} ${params.cardName}`,
      description: params.cardDescription ?? "FreshPick AI로 오늘 우리 가족 뭐 먹을지 골라봐요!",
      imageUrl: params.imageUrl ?? `${appUrl}/cards/${params.cardId}/opengraph-image`,
      link,
    },
    buttons: [{ title: "메뉴 보기", link }],
    serverCallbackArgs: { card_id: params.cardId, action: "card_share" },
  });

  return true;
}
