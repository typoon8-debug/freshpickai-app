import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNotificationSettings } from "@/lib/actions/profile/notifications";
import { NotificationSettingsForm } from "./_components/notification-settings-form";
import { TopHeader } from "@/components/layout/top-header";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const settings = await getNotificationSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <TopHeader title="알림 설정" backHref="/profile" />
      <div className="flex-1 px-4 py-6">
        <NotificationSettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
