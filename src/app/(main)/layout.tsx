import dynamic from "next/dynamic";
import { BottomTabNav } from "@/components/layout/bottom-tab-nav";
import { OnboardingGuard } from "@/components/layout/onboarding-guard";

// Firebase(~150KB)와 Realtime 구독 코드를 초기 번들에서 분리 — 인터랙션 후 지연 로드
const FcmInitializer = dynamic(
  () => import("@/components/push/FcmInitializer").then((m) => ({ default: m.FcmInitializer })),
  { ssr: false }
);
const NotificationProvider = dynamic(
  () =>
    import("@/components/push/NotificationProvider").then((m) => ({
      default: m.NotificationProvider,
    })),
  { ssr: false }
);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-paper flex min-h-screen flex-col">
      <OnboardingGuard />
      <FcmInitializer />
      <NotificationProvider />
      <main className="flex-1 pb-20">{children}</main>
      <BottomTabNav />
    </div>
  );
}
