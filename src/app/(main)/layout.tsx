import { BottomTabNav } from "@/components/layout/bottom-tab-nav";
import { OnboardingGuard } from "@/components/layout/onboarding-guard";
import { FcmInitializer } from "@/components/push/FcmInitializer";
import { NotificationProvider } from "@/components/push/NotificationProvider";

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
