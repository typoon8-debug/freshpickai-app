"use client";

import { KidsHeader } from "@/components/kids/kids-header";
import { MascotBubble } from "@/components/kids/mascot-bubble";
import { FoodPicker } from "@/components/kids/food-picker";
import { DailyMission } from "@/components/kids/daily-mission";
import { BadgeGrid } from "@/components/kids/badge-grid";
import { KidsFooter } from "@/components/kids/kids-footer";

export default function KidsPage() {
  return (
    <>
      <KidsHeader kidName="하준" />
      <div className="flex flex-col gap-6 pb-24">
        <MascotBubble message="오늘 뭐 먹고 싶어? 골라봐! 🥰" />
        <FoodPicker />
        <DailyMission current={2} total={3} />
        <BadgeGrid />
      </div>
      <KidsFooter />
    </>
  );
}
