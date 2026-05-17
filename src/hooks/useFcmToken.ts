"use client";

import { useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { upsertFcmToken } from "@/lib/actions/push/fcm";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** 로그인 후 FCM 토큰을 수집하고 서버에 저장 */
export function useFcmToken() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return;

    initialized.current = true;

    async function initFcm() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        if (!getApps().length) {
          initializeApp(firebaseConfig);
        }

        const messaging = getMessaging();

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.ready,
        });

        if (token) {
          await upsertFcmToken(token);
        }

        // 포그라운드 메시지 핸들러
        onMessage(messaging, (payload) => {
          const { notification } = payload;
          if (!notification?.title) return;

          new Notification(notification.title, {
            body: notification.body ?? "",
            icon: "/icons/icon-192x192.png",
            data: payload.data,
          });
        });
      } catch {
        // 알림 권한 거부 또는 설정 없음 — 무시
      }
    }

    initFcm();
  }, []);
}
