import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNotificationSettings } from "@/lib/actions/profile/notifications";
import { NotificationSettingsForm } from "./_components/notification-settings-form";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const settings = await getNotificationSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-4">
        <h1 className="text-lg font-semibold">알림 설정</h1>
      </header>

      <div className="flex-1 px-4 py-6">
        <NotificationSettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
