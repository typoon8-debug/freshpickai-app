"use client";

import { useEffect, useState, useCallback } from "react";

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface PwaInstallState {
  showBanner: boolean;
  isIos: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
}

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const elapsed = (Date.now() - parseInt(raw, 10)) / 86_400_000;
  if (elapsed < DISMISS_DAYS) return true;
  localStorage.removeItem(DISMISS_KEY);
  return false;
}

export function usePwaInstall(): PwaInstallState {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  // lazy initializer: SSR 안전 + effect 내 동기 setState 없이 초기값 계산
  const [isInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(display-mode: standalone)").matches;
  });
  const [isIos] = useState(() => {
    if (typeof window === "undefined") return false;
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  });
  const [isMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return /android|iphone|ipad|ipod|mobile/i.test(window.navigator.userAgent);
  });
  const [isDismissed, setIsDismissed] = useState(readDismissed);
  const [appInstalled, setAppInstalled] = useState(false);

  // 이벤트 리스너만 effect에서 등록 — setState는 콜백에서만 호출
  useEffect(() => {
    if (isInstalled || isDismissed) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setAppInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [isInstalled, isDismissed]);

  const install = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") setAppInstalled(true);
    setPromptEvent(null);
  }, [promptEvent]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  }, []);

  const showBanner =
    !isInstalled && !appInstalled && !isDismissed && isMobile && (!!promptEvent || isIos);

  return { showBanner, isIos, install, dismiss };
}
