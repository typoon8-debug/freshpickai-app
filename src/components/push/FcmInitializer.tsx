"use client";

import { useFcmToken } from "@/hooks/useFcmToken";

/** 메인 레이아웃에 마운트 — FCM 토큰 수집 및 포그라운드 핸들러 등록 */
export function FcmInitializer() {
  useFcmToken();
  return null;
}
