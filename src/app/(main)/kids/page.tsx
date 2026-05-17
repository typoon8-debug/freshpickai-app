import { KidsHeader } from "@/components/kids/kids-header";
import { MascotBubble } from "@/components/kids/mascot-bubble";
import { FoodPicker } from "@/components/kids/food-picker";
import { DailyMission } from "@/components/kids/daily-mission";
import { BadgeGrid } from "@/components/kids/badge-grid";
import { KidsFooter } from "@/components/kids/kids-footer";
import { KidsTabView } from "@/components/home/KidsTabView";
import { getFamilyMembers } from "@/lib/actions/family";
import type { FamilyMember } from "@/lib/types";

export default async function KidsPage() {
  const allMembers = await getFamilyMembers();
  const kidsMembers = allMembers
    .filter((m) => m.familyRole === "kid" || m.familyRole === "teen")
    .map((m) => ({
      memberId: m.memberId,
      displayName: m.displayName,
      familyRole: m.familyRole as FamilyMember["familyRole"],
    }));

  return (
    <>
      <KidsHeader kidName="하준" />
      <div className="flex flex-col gap-6 pb-24">
        <MascotBubble message="오늘 뭐 먹고 싶어? 골라봐! 🥰" />
        <FoodPicker />

        {/* 연령별 카드 탭 */}
        <section>
          <h2 className="text-ink-700 mb-3 px-4 text-sm font-semibold">연령별 추천 카드 🎯</h2>
          <KidsTabView kidsMembers={kidsMembers} />
        </section>

        <DailyMission current={2} total={3} />
        <BadgeGrid />
      </div>
      <KidsFooter />
    </>
  );
}
