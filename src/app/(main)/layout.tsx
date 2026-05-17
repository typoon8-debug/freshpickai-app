import { BottomTabNav } from "@/components/layout/bottom-tab-nav";
import { ClientProviders } from "@/components/layout/client-providers";
import { OnboardingGuard } from "@/components/layout/onboarding-guard";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-paper flex min-h-screen flex-col">
      <OnboardingGuard />
      <ClientProviders />
      <main className="flex-1 pb-20">{children}</main>
      <BottomTabNav />
    </div>
  );
}
