"use client";

import { useState, useTransition } from "react";
import { Bell, Film, Truck, Vote } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { updateNotificationSettings } from "@/lib/actions/profile/notifications";
import type { NotificationSettings } from "@/lib/types";

interface Props {
  initialSettings: NotificationSettings;
}

type SettingKey = keyof NotificationSettings;

const SETTING_ITEMS: {
  key: SettingKey;
  icon: React.ReactNode;
  label: string;
  description: string;
}[] = [
  {
    key: "voteNotify",
    icon: <Vote className="text-primary h-5 w-5" />,
    label: "가족 투표",
    description: "새 투표 안건이 생성되거나 마감 임박 시 알림",
  },
  {
    key: "movieNightNotify",
    icon: <Film className="h-5 w-5 text-purple-500" />,
    label: "무비나이트",
    description: "무비나이트 카드 생성 완료 시 알림",
  },
  {
    key: "deliveryNotify",
    icon: <Truck className="h-5 w-5 text-green-500" />,
    label: "배송 상태",
    description: "배달기사 배정, 출발, 도착 등 배송 변경 시 알림",
  },
];

export function NotificationSettingsForm({ initialSettings }: Props) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();

  function handleToggle(key: SettingKey, value: boolean) {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    startTransition(async () => {
      const result = await updateNotificationSettings(updated);
      if (!result.ok) {
        setSettings(settings); // 롤백
        toast.error("설정 저장 실패");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="text-muted-foreground h-5 w-5" />
        <p className="text-muted-foreground text-sm">받고 싶은 알림을 선택하세요</p>
      </div>

      {SETTING_ITEMS.map(({ key, icon, label, description }) => (
        <div key={key} className="flex items-center justify-between rounded-xl border p-4">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
            </div>
          </div>
          <Switch
            checked={settings[key]}
            disabled={isPending}
            onCheckedChange={(checked: boolean) => handleToggle(key, checked)}
          />
        </div>
      ))}
    </div>
  );
}
