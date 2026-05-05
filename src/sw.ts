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

    // Next.js 최적화 이미지 → StaleWhileRevalidate
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/image"),
      handler: new StaleWhileRevalidate({
        cacheName: "next-images",
        plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 })],
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
