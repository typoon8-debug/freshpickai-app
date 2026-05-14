"use client";

import { cn } from "@/lib/utils";
import type { FamilyMember } from "@/lib/types";

const MOCK_MEMBERS: FamilyMember[] = [
  {
    memberId: "m1",
    groupId: "g1",
    userId: "u1",
    displayName: "엄마",
    familyRole: "parent",
    level: 8,
    online: true,
    todayActivity: "된장찌개 레시피 확인",
    joinedAt: "2024-01-01",
  },
  {
    memberId: "m2",
    groupId: "g1",
    userId: "u2",
    displayName: "아빠",
    familyRole: "parent",
    level: 5,
    online: false,
    todayActivity: "장바구니 3개 추가",
    joinedAt: "2024-01-01",
  },
  {
    memberId: "m3",
    groupId: "g1",
    userId: "u3",
    displayName: "서연",
    familyRole: "teen",
    level: 3,
    online: true,
    todayActivity: "비건 메뉴 추천 요청",
    joinedAt: "2024-03-01",
  },
  {
    memberId: "m4",
    groupId: "g1",
    userId: "u4",
    displayName: "하준",
    familyRole: "kid",
    level: 2,
    online: true,
    todayActivity: "치킨 5번 선택 👍",
    joinedAt: "2024-03-01",
  },
];

const ROLE_EMOJI: Record<FamilyMember["familyRole"], string> = {
  parent: "👨‍👩‍",
  teen: "🧑‍",
  kid: "🧒",
};

const ROLE_LABEL: Record<FamilyMember["familyRole"], string> = {
  parent: "부모",
  teen: "청소년",
  kid: "아이",
};

interface MemberGridProps {
  members?: FamilyMember[];
}

export function MemberGrid({ members = MOCK_MEMBERS }: MemberGridProps) {
  return (
    <section className="px-4">
      <h3 className="text-ink-700 mb-3 text-sm font-semibold">가족 구성원</h3>
      <div className="grid grid-cols-2 gap-3">
        {members.map((member) => (
          <div
            key={member.memberId}
            className="border-line flex items-center gap-3 rounded-lg border bg-white p-3"
          >
            {/* 아바타 */}
            <div className="relative">
              <div className="bg-mocha-100 flex h-10 w-10 items-center justify-center rounded-full text-lg">
                {ROLE_EMOJI[member.familyRole]}
              </div>
              <span
                className={cn(
                  "absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                  member.online ? "bg-sage" : "bg-ink-200"
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-ink-900 text-sm font-semibold">{member.displayName}</span>
                <span className="text-ink-400 text-[10px]">{ROLE_LABEL[member.familyRole]}</span>
              </div>
              <p className="text-ink-400 mt-0.5 truncate text-[11px]">{member.todayActivity}</p>
              <p className="text-mocha-500 mt-0.5 text-[10px] font-medium">Lv.{member.level}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
