import { createClient } from "@/lib/supabase/server";
import { embedText, embeddingToSql } from "./embedding";

// ── 페르소나 ID (9종) ─────────────────────────────────────────
export type PersonaId =
  | "family_manager" // P1: 가족 저녁 매니저
  | "solo_efficient" // P2: 효율 1인식
  | "working_couple" // P3: 맞벌이 부부
  | "health_senior" // P4: 건강 시니어
  | "budget_student" // P5: 가성비 대학생
  | "premium_gourmet" // P6: 프리미엄 미식가
  | "working_mom" // P7: 워킹맘
  | "young_chef" // P8: 막내셰프
  | "trend_curator"; // P9: 트렌드 큐레이터

export const PERSONA_NAMES: Record<PersonaId, string> = {
  family_manager: "가족 저녁 매니저",
  solo_efficient: "효율 1인식",
  working_couple: "맞벌이 부부",
  health_senior: "건강 시니어",
  budget_student: "가성비 대학생",
  premium_gourmet: "프리미엄 미식가",
  working_mom: "워킹맘",
  young_chef: "막내셰프",
  trend_curator: "트렌드 큐레이터",
};

export const PERSONA_DESCRIPTIONS: Record<PersonaId, string> = {
  family_manager: "3인 이상 가족의 저녁 메뉴를 책임지는 주요 구매자",
  solo_efficient: "혼자 사는 바쁜 직장인, 간단하고 빠른 한 끼",
  working_couple: "둘이 함께하는 간편하고 센스 있는 저녁",
  health_senior: "건강과 식이 관리를 최우선으로 하는 구매자",
  budget_student: "가성비를 중시하는 1인 가구, 합리적인 식재료 구매",
  premium_gourmet: "프리미엄 식재료와 고급 레시피를 즐기는 미식가",
  working_mom: "바쁜 일상 속 가족을 위한 빠르고 영양 있는 저녁",
  young_chef: "요리 자체를 즐기는 홈쿡 열정파",
  trend_curator: "비건·글루텐프리 등 최신 푸드 트렌드를 리드하는 구매자",
};

export type CookingSkill = "beginner" | "intermediate" | "advanced";
export type ShoppingTime = "morning" | "afternoon" | "evening";
export type BudgetLevel = "low" | "mid" | "high";

export type PersonaContext = {
  personaId: PersonaId;
  personaName: string;
  personaDescription: string;
  userId: string;
  cookTimeMin: number;
  budgetLevel: BudgetLevel;
  dietaryTags: string[];
  wellnessGoals: string[];
  householdSize: number;
  cookingSkill: CookingSkill;
  preferredShoppingTime: ShoppingTime;
  personaTags: string[];
};

// ── 페르소나 분류 입력 ────────────────────────────────────────
type ClassifyInput = {
  householdSize: number;
  cookTimeMin: number;
  budgetLevel: BudgetLevel;
  cookingSkill: CookingSkill;
  wellnessGoals: string[];
  dietaryTags: string[];
  personaTags: string[];
};

const HEALTH_GOALS = ["혈당관리", "저속노화", "면역강화", "소화개선"] as const;
const TREND_DIETS = ["비건", "글루텐프리", "할랄", "오가닉"] as const;
const LOW_CAL_INGREDIENTS = ["닭가슴살", "두부", "곤약"] as const;
const HIGH_PROTEIN_INGREDIENTS = ["닭가슴살", "계란", "참치", "연어", "소고기"] as const;

// ── 페르소나 분류 (가중치 점수 방식) ─────────────────────────
function classifyPersona(input: ClassifyInput): PersonaId {
  const scores: Record<PersonaId, number> = {
    family_manager: 0,
    solo_efficient: 0,
    working_couple: 0,
    health_senior: 0,
    budget_student: 0,
    premium_gourmet: 0,
    working_mom: 0,
    young_chef: 0,
    trend_curator: 0,
  };

  const {
    householdSize,
    cookTimeMin,
    budgetLevel,
    cookingSkill,
    wellnessGoals,
    dietaryTags,
    personaTags,
  } = input;
  const isFemaleSig = personaTags.includes("female");

  // P1: 가족 저녁 매니저 — 3인 이상, 30분 이내, 중예산, 여성 신호
  if (householdSize >= 3) scores.family_manager += 3;
  if (cookTimeMin <= 30) scores.family_manager += 1;
  if (budgetLevel === "mid") scores.family_manager += 1;
  if (isFemaleSig) scores.family_manager += 1;

  // P2: 효율 1인식 — 1인, 10분 이내, 저·중예산, 저칼로리
  if (householdSize === 1) scores.solo_efficient += 3;
  if (cookTimeMin <= 10) scores.solo_efficient += 2;
  if (budgetLevel === "low") scores.solo_efficient += 1;
  if (dietaryTags.some((t) => (LOW_CAL_INGREDIENTS as readonly string[]).includes(t)))
    scores.solo_efficient += 1;

  // P3: 맞벌이 부부 — 2인, 20분 이내, 중예산
  if (householdSize === 2) scores.working_couple += 3;
  if (cookTimeMin <= 20) scores.working_couple += 2;
  if (budgetLevel === "mid") scores.working_couple += 1;

  // P4: 건강 시니어 — 건강목표 중심, 저GI·항산화, 30분 이상도 허용
  const healthGoalScore = wellnessGoals.filter((g) =>
    (HEALTH_GOALS as readonly string[]).includes(g)
  ).length;
  scores.health_senior += healthGoalScore * 2;
  if (dietaryTags.some((t) => ["저GI", "항산화", "고식이섬유"].includes(t)))
    scores.health_senior += 2;
  if (cookTimeMin >= 30) scores.health_senior += 1;

  // P5: 가성비 대학생 — 저예산, 1인, 빠른 요리, 초보
  if (budgetLevel === "low") scores.budget_student += 3;
  if (householdSize === 1) scores.budget_student += 1;
  if (cookTimeMin <= 10) scores.budget_student += 1;
  if (cookingSkill === "beginner") scores.budget_student += 2;

  // P6: 프리미엄 미식가 — 고예산, 고급 실력, 프리미엄 식재료
  if (budgetLevel === "high") scores.premium_gourmet += 4;
  if (cookingSkill === "advanced") scores.premium_gourmet += 2;
  if (dietaryTags.some((t) => ["프리미엄", "오가닉"].includes(t))) scores.premium_gourmet += 2;

  // P7: 워킹맘 — 3인 이상 가족, 20분 이내, 여성 신호, 비고예산
  if (householdSize >= 3) scores.working_mom += 2;
  if (cookTimeMin <= 20) scores.working_mom += 2;
  if (isFemaleSig) scores.working_mom += 3;
  if (budgetLevel !== "high") scores.working_mom += 1;

  // P8: 막내셰프 — 중·고급 요리 실력, 요리 관련 태그
  if (cookingSkill === "advanced") scores.young_chef += 3;
  if (cookingSkill === "intermediate") scores.young_chef += 2;
  if (
    wellnessGoals.includes("요리실력") ||
    dietaryTags.some((t) => (HIGH_PROTEIN_INGREDIENTS as readonly string[]).includes(t))
  )
    scores.young_chef += 1;

  // P9: 트렌드 큐레이터 — 비건·글루텐프리 등 트렌디한 식이, trendy 태그
  const trendTagScore = dietaryTags.filter((t) =>
    (TREND_DIETS as readonly string[]).includes(t)
  ).length;
  scores.trend_curator += trendTagScore * 2;
  if (personaTags.includes("trendy")) scores.trend_curator += 2;
  if (cookingSkill !== "beginner") scores.trend_curator += 1;

  // 최고 점수 페르소나 선택
  const entries = Object.entries(scores) as [PersonaId, number][];
  const maxScore = Math.max(...entries.map(([, s]) => s));

  if (maxScore === 0) {
    // 모두 0점 → 인원 수 기반 기본값
    if (householdSize === 1) return "solo_efficient";
    if (householdSize === 2) return "working_couple";
    return "family_manager";
  }

  const best = entries.find(([, s]) => s === maxScore);
  return best ? best[0] : "family_manager";
}

// ── persona_tags 인코딩 헬퍼 ──────────────────────────────────
function parseTagValue(tags: string[], prefix: string): string | undefined {
  return tags.find((t) => t.startsWith(`${prefix}:`))?.split(":")[1];
}

// ── 메인 빌더 함수 ────────────────────────────────────────────
export async function buildPersonaContext(userId: string): Promise<PersonaContext> {
  const supabase = await createClient();

  const { data: pref } = await supabase
    .from("fp_user_preference")
    .select("*")
    .eq("user_id", userId)
    .single();

  const personaTags: string[] = pref?.persona_tags ?? [];
  const dietaryTags: string[] = pref?.dietary_tags ?? [];
  const wellnessGoals: string[] = pref?.wellness_goals ?? [];
  const cookTimeMin: number = pref?.cook_time_min ?? 30;

  const rawBudget = pref?.budget_level ?? "mid";
  const budgetLevel: BudgetLevel = rawBudget === "low" || rawBudget === "high" ? rawBudget : "mid";

  // persona_tags에서 인코딩된 메타 값 파싱
  const householdSize = parseInt(parseTagValue(personaTags, "household") ?? "3") || 3;
  const rawSkill = parseTagValue(personaTags, "skill");
  const cookingSkill: CookingSkill =
    rawSkill === "beginner" || rawSkill === "advanced" ? rawSkill : "intermediate";
  const rawShopTime = parseTagValue(personaTags, "shop_time");
  const preferredShoppingTime: ShoppingTime =
    rawShopTime === "morning" || rawShopTime === "evening" ? rawShopTime : "afternoon";

  const personaId = classifyPersona({
    householdSize,
    cookTimeMin,
    budgetLevel,
    cookingSkill,
    wellnessGoals,
    dietaryTags,
    personaTags,
  });

  const ctx: PersonaContext = {
    personaId,
    personaName: PERSONA_NAMES[personaId],
    personaDescription: PERSONA_DESCRIPTIONS[personaId],
    userId,
    cookTimeMin,
    budgetLevel,
    dietaryTags,
    wellnessGoals,
    householdSize,
    cookingSkill,
    preferredShoppingTime,
    personaTags,
  };

  // 페르소나 컨텍스트 텍스트 임베딩 → fp_user_preference.embedding 비동기 저장 (논블로킹)
  void savePersonaEmbedding(supabase, userId, ctx);

  return ctx;
}

function buildPersonaContextText(ctx: PersonaContext): string {
  return [
    `페르소나: ${ctx.personaName} — ${ctx.personaDescription}`,
    `예산: ${ctx.budgetLevel}`,
    `조리 시간: ${ctx.cookTimeMin}분 이내`,
    `조리 실력: ${ctx.cookingSkill}`,
    `가구 인원: ${ctx.householdSize}명`,
    ctx.dietaryTags.length > 0 ? `식이 태그: ${ctx.dietaryTags.join(", ")}` : "",
    ctx.wellnessGoals.length > 0 ? `건강 목표: ${ctx.wellnessGoals.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function savePersonaEmbedding(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: Awaited<ReturnType<typeof createClient>> | any,
  userId: string,
  ctx: PersonaContext
): Promise<void> {
  try {
    const text = buildPersonaContextText(ctx);
    const embedding = await embedText(text);
    await supabase
      .from("fp_user_preference")
      .update({ embedding: embeddingToSql(embedding) })
      .eq("user_id", userId);
  } catch {
    // 임베딩 저장 실패는 조용히 무시 (비핵심 경로)
  }
}
