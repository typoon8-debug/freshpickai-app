// ============================================================
// 가족 관계 · 성별 상수
// fp_family_member.relationship, fp_user_profile.gender 공유
// ============================================================

export type RelationshipType =
  | "dad"
  | "mom"
  | "husband"
  | "wife"
  | "son"
  | "daughter"
  | "elder_brother"
  | "elder_sister"
  | "younger_brother"
  | "younger_sister"
  | "grandfather"
  | "grandmother"
  | "other";

export type GenderType = "male" | "female" | "other";

export type FamilyRoleType = "parent" | "teen" | "kid";

// ── 관계 코드 → 레이블 + 이모티콘 ──────────────────────────
export const RELATIONSHIP_CONFIG: Record<RelationshipType, { label: string; emoji: string }> = {
  dad: { label: "아빠", emoji: "👨" },
  mom: { label: "엄마", emoji: "👩" },
  husband: { label: "남편", emoji: "👨" },
  wife: { label: "아내", emoji: "👩" },
  son: { label: "아들", emoji: "👦" },
  daughter: { label: "딸", emoji: "👧" },
  elder_brother: { label: "형/오빠", emoji: "🧑" },
  elder_sister: { label: "누나/언니", emoji: "👱‍♀️" },
  younger_brother: { label: "남동생", emoji: "👦" },
  younger_sister: { label: "여동생", emoji: "👧" },
  grandfather: { label: "할아버지", emoji: "👴" },
  grandmother: { label: "할머니", emoji: "👵" },
  other: { label: "기타", emoji: "👤" },
};

export const RELATIONSHIP_OPTIONS: RelationshipType[] = [
  "dad",
  "mom",
  "husband",
  "wife",
  "son",
  "daughter",
  "elder_brother",
  "elder_sister",
  "younger_brother",
  "younger_sister",
  "grandfather",
  "grandmother",
  "other",
];

// ── 성별 코드 → 레이블 + 이모티콘 ──────────────────────────
export const GENDER_CONFIG: Record<GenderType, { label: string; emoji: string }> = {
  male: { label: "남성", emoji: "👨" },
  female: { label: "여성", emoji: "👩" },
  other: { label: "기타", emoji: "🧑" },
};

// ── 가족 역할 코드 → 레이블 ─────────────────────────────────
export const FAMILY_ROLE_CONFIG: Record<FamilyRoleType, { label: string; description: string }> = {
  parent: { label: "부모/어른", description: "30대 이상 성인 구성원" },
  teen: { label: "10대", description: "중학생~고등학생" },
  kid: { label: "아이", description: "초등학생 이하" },
};

// ── gender + familyRole 조합 → AI 페르소나 설명 ─────────────
export function buildRoleLabel(familyRole: FamilyRoleType, gender: GenderType | null): string {
  if (familyRole === "parent") {
    if (gender === "male") return "아빠";
    if (gender === "female") return "엄마";
    return "부모/어른";
  }
  if (familyRole === "teen") {
    if (gender === "male") return "10대 남학생";
    if (gender === "female") return "10대 여학생";
    return "10대 청소년";
  }
  return "아이";
}
