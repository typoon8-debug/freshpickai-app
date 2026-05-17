"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardGrid } from "@/components/home/card-grid";
import { useKidsFilter, type AgeGroup } from "@/hooks/useKidsFilter";
import type { FamilyMember } from "@/lib/types";

interface KidsTabViewProps {
  kidsMembers?: Pick<FamilyMember, "memberId" | "displayName" | "familyRole">[];
}

function AgeGroupGrid({ ageGroup }: { ageGroup: AgeGroup }) {
  const { cards, loading } = useKidsFilter(ageGroup);
  return <CardGrid cards={cards} loading={loading} />;
}

export function KidsTabView({ kidsMembers = [] }: KidsTabViewProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(kidsMembers[0]?.memberId ?? "");

  return (
    <div className="flex flex-col gap-4 px-4">
      {/* 아이 프로필 선택 */}
      {kidsMembers.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-ink-500 text-xs">대상:</span>
          <div className="flex gap-2 overflow-x-auto">
            {kidsMembers.map((m) => (
              <button
                key={m.memberId}
                type="button"
                onClick={() => setSelectedMemberId(m.memberId)}
                className={
                  selectedMemberId === m.memberId
                    ? "rounded-full bg-olive-500 px-3 py-1 text-xs font-semibold text-white"
                    : "border-line text-ink-500 rounded-full border px-3 py-1 text-xs"
                }
              >
                {m.displayName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 연령대 탭 */}
      <Tabs defaultValue="elementary">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="elementary">
            <span className="mr-1">🍭</span>초등 (간식·디저트)
          </TabsTrigger>
          <TabsTrigger value="teen">
            <span className="mr-1">🌍</span>청소년 (트렌드·글로벌)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="elementary" className="mt-3">
          <AgeGroupGrid ageGroup="ELEMENTARY" />
        </TabsContent>
        <TabsContent value="teen" className="mt-3">
          <AgeGroupGrid ageGroup="TEEN" />
        </TabsContent>
      </Tabs>

      {selectedMemberId && (
        <p className="text-ink-400 text-center text-xs">
          카드를 탭해 상세 페이지에서 별점을 남길 수 있어요 ⭐
        </p>
      )}
    </div>
  );
}
