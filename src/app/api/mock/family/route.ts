import { NextResponse } from "next/server";
import type { FamilyMember } from "@/lib/types";

const MOCK_FAMILY: FamilyMember[] = [
  {
    memberId: "m01",
    groupId: "g01",
    userId: "u01",
    displayName: "엄마",
    familyRole: "parent",
    level: 12,
    online: true,
    todayActivity: "갈비찜 카드 저장",
    joinedAt: "2024-01-01T00:00:00Z",
  },
  {
    memberId: "m02",
    groupId: "g01",
    userId: "u02",
    displayName: "아빠",
    familyRole: "parent",
    level: 8,
    online: false,
    todayActivity: "불고기 파티 투표",
    joinedAt: "2024-01-01T00:00:00Z",
  },
  {
    memberId: "m03",
    groupId: "g01",
    userId: "u03",
    displayName: "서연",
    familyRole: "teen",
    level: 5,
    online: true,
    todayActivity: "K디저트 탐색 중",
    joinedAt: "2024-02-10T00:00:00Z",
  },
  {
    memberId: "m04",
    groupId: "g01",
    userId: "u04",
    displayName: "하준",
    familyRole: "kid",
    level: 3,
    online: true,
    todayActivity: "간식팩 선택",
    joinedAt: "2024-02-10T00:00:00Z",
  },
  {
    memberId: "m05",
    groupId: "g01",
    userId: "u05",
    displayName: "할머니",
    familyRole: "parent",
    level: 6,
    online: false,
    todayActivity: "가족레시피 공유",
    joinedAt: "2024-03-05T00:00:00Z",
  },
];

export async function GET() {
  return NextResponse.json({ data: MOCK_FAMILY, error: null });
}
