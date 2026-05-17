import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
  Serwist,
  ExpirationPlugin,
} from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// ── FCM 백그라운드 푸시 메시지 핸들러 ────────────────────────
// PushEvent, NotificationEvent, WindowClient는 webworker lib에 있으므로 인라인 선언
declare class PushMessageData {
  json(): unknown;
}
declare class PushEvent extends ExtendableEvent {
  readonly data: PushMessageData | null;
}
declare class NotificationEvent extends ExtendableEvent {
  readonly notification: { close(): void; data: unknown };
}
interface WindowClient {
  url: string;
  focus(): Promise<WindowClient>;
}
declare class ExtendableEvent extends Event {
  waitUntil(f: Promise<unknown>): void;
}

const sw = self as unknown as {
  addEventListener(type: string, listener: (e: unknown) => void): void;
  registration: { showNotification(title: string, options?: object): Promise<void> };
  clients: {
    matchAll(options?: object): Promise<WindowClient[]>;
    openWindow(url: string): Promise<WindowClient | null>;
  };
};

sw.addEventListener("push", (event) => {
  const pushEvent = event as PushEvent;
  if (!pushEvent.data) return;

  let payload: {
    notification?: { title?: string; body?: string };
    data?: Record<string, string>;
  };
  try {
    payload = pushEvent.data.json() as typeof payload;
  } catch {
    return;
  }

  const title = payload.notification?.title ?? "FreshPickAI";
  const body = payload.notification?.body ?? "";
  const link = payload.data?.link ?? "/";

  pushEvent.waitUntil(
    sw.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data: { link },
    })
  );
});

sw.addEventListener("notificationclick", (event) => {
  const notifEvent = event as NotificationEvent;
  notifEvent.notification.close();
  const link = (notifEvent.notification.data as { link?: string }).link ?? "/";
  notifEvent.waitUntil(
    sw.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(link));
      if (existing) return existing.focus();
      return sw.clients.openWindow(link);
    })
  );
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },

  runtimeCaching: [
    // 결제·인증·API → 캐시 금지
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/checkout") ||
        url.pathname.startsWith("/api/") ||
        url.hostname.includes("supabase.co"),
      handler: new NetworkOnly(),
    },

    // 페이지 navigation → NetworkFirst
    {
      matcher: ({ request }) => request.destination === "document",
      handler: new NetworkFirst({
        networkTimeoutSeconds: 3,
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 })],
      }),
    },

    // 외부 이미지 → StaleWhileRevalidate
    {
      matcher: ({ url }) =>
        url.hostname === "images.unsplash.com" || url.hostname === "api.dicebear.com",
      handler: new StaleWhileRevalidate({
        cacheName: "external-images",
        plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 14 })],
      }),
    },

    // Next.js 최적화 이미지 → NetworkFirst
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/image"),
      handler: new NetworkFirst({
        cacheName: "next-images",
        plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 })],
      }),
    },

    // 정적 자산 → CacheFirst (1년)
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/_next/static") || url.pathname.includes("/fonts/"),
      handler: new CacheFirst({
        cacheName: "static-assets",
        plugins: [new ExpirationPlugin({ maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 365 })],
      }),
    },

    // PWA 자산 → CacheFirst (30일)
    {
      matcher: ({ url }) => url.pathname.match(/\.(png|webmanifest|ico)$/) !== null,
      handler: new CacheFirst({
        cacheName: "pwa-assets",
        plugins: [new ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 30 })],
      }),
    },
  ],
});

serwist.addEventListeners();
