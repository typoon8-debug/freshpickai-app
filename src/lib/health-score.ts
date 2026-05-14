import type { Ingredient, ItemCalories } from "@/lib/types";

export type HealthScore = {
  slowAging: number; // 0-1 저속노화 지수 (항산화·가공도·식이섬유)
  glycemicIndex: number; // 0-1 혈당 지수 (높을수록 저GI = 좋음)
  nutrition: number; // 0-1 영양 밸런스 (단백질·탄수화물·지방 비율)
  overall: number; // 0-1 가중 평균
};

// ── 식재료 키워드 분류 ─────────────────────────────────────────
const ANTI_AGING = [
  "브로콜리",
  "시금치",
  "당근",
  "토마토",
  "블루베리",
  "딸기",
  "귤",
  "레몬",
  "마늘",
  "양파",
  "파프리카",
  "케일",
  "버섯",
  "두부",
  "연어",
  "견과류",
  "올리브",
  "아보카도",
  "고구마",
  "보리",
  "귀리",
  "콩",
  "팥",
  "렌틸",
  "현미",
  "흑미",
  "흑임자",
  "깻잎",
  "쑥",
  "미역",
  "다시마",
  "김",
  "인절미",
  "참깨",
  "들깨",
  "생강",
  "강황",
];
const PROCESSED = [
  "소세지",
  "햄",
  "베이컨",
  "라면",
  "과자",
  "통조림",
  "팝콘",
  "나초",
  "가공",
  "냉동",
  "인스턴트",
  "스팸",
  "어묵",
  "맛살",
];
const HIGH_GI = [
  "밀가루",
  "흰쌀",
  "설탕",
  "빵",
  "국수",
  "떡",
  "쌀국수",
  "식빵",
  "과자",
  "도넛",
  "케이크",
  "물엿",
  "액상과당",
];
const LOW_GI = [
  "고구마",
  "콩",
  "렌틸",
  "귀리",
  "보리",
  "현미",
  "흑미",
  "사과",
  "배",
  "채소",
  "두부",
  "버섯",
  "아보카도",
];
const PROTEINS = [
  "소고기",
  "갈비",
  "등심",
  "안심",
  "돼지고기",
  "삼겹",
  "목살",
  "닭",
  "닭가슴",
  "달걀",
  "계란",
  "두부",
  "생선",
  "참치",
  "연어",
  "새우",
  "굴",
  "조개",
  "오징어",
  "문어",
  "게",
  "오리",
  "양고기",
];
const VEGGIES = [
  "채소",
  "배추",
  "양배추",
  "상추",
  "깻잎",
  "시금치",
  "브로콜리",
  "당근",
  "오이",
  "호박",
  "가지",
  "파프리카",
  "피망",
  "버섯",
  "콩나물",
  "숙주",
  "무",
  "파",
  "마늘",
  "생강",
  "양파",
  "대파",
  "쪽파",
  "고추",
  "청양고추",
  "부추",
];
const CARBS = ["쌀", "밥", "국수", "면", "빵", "떡", "감자", "고구마", "밀가루"];
const FATS = [
  "기름",
  "참기름",
  "들기름",
  "올리브유",
  "버터",
  "치즈",
  "크림",
  "마요네즈",
  "견과류",
  "아보카도",
  "땅콩",
];

function matchAny(name: string, keywords: string[]): boolean {
  return keywords.some((k) => name.includes(k));
}

function calcSlowAging(ingredients: Ingredient[]): number {
  if (ingredients.length === 0) return 0.5;
  let antiScore = 0;
  let processedPenalty = 0;
  for (const ing of ingredients) {
    if (matchAny(ing.name, ANTI_AGING)) antiScore += 1;
    if (matchAny(ing.name, VEGGIES)) antiScore += 0.5;
    if (matchAny(ing.name, PROCESSED)) processedPenalty += 1;
  }
  const base = Math.min(1, antiScore / Math.max(1, ingredients.length * 0.7));
  const penalty = Math.min(0.4, processedPenalty * 0.15);
  return Math.max(0.1, Math.min(1, base - penalty));
}

function calcGI(ingredients: Ingredient[]): number {
  if (ingredients.length === 0) return 0.5;
  let highGiCount = 0;
  let lowGiCount = 0;
  for (const ing of ingredients) {
    if (matchAny(ing.name, HIGH_GI)) highGiCount++;
    if (matchAny(ing.name, LOW_GI)) lowGiCount++;
  }
  // 저GI 비율↑ = 점수↑, 고GI 비율↑ = 점수↓
  const base = 0.6 - highGiCount * 0.08 + lowGiCount * 0.08;
  return Math.max(0.1, Math.min(1, base));
}

function calcNutrition(ingredients: Ingredient[]): number {
  if (ingredients.length === 0) return 0.5;
  let proteinCount = 0;
  let carbCount = 0;
  let fatCount = 0;
  for (const ing of ingredients) {
    if (matchAny(ing.name, PROTEINS)) proteinCount++;
    if (matchAny(ing.name, CARBS)) carbCount++;
    if (matchAny(ing.name, FATS)) fatCount++;
  }
  const total = proteinCount + carbCount + fatCount;
  if (total === 0) return 0.45;
  // 이상 비율: 단백질 30%, 탄수화물 50%, 지방 20%
  const proteinRatio = proteinCount / total;
  const carbRatio = carbCount / total;
  const fatRatio = fatCount / total;
  const diff = Math.abs(proteinRatio - 0.3) + Math.abs(carbRatio - 0.5) + Math.abs(fatRatio - 0.2);
  return Math.max(0.1, Math.min(1, 1 - diff * 0.8));
}

export function calcHealthScore(ingredients: Ingredient[]): HealthScore {
  const slowAging = calcSlowAging(ingredients);
  const glycemicIndex = calcGI(ingredients);
  const nutrition = calcNutrition(ingredients);
  const overall = slowAging * 0.35 + glycemicIndex * 0.35 + nutrition * 0.3;
  return { slowAging, glycemicIndex, nutrition, overall };
}

/**
 * full 레벨 재료가 50% 이상일 때 ai_tags + ai_calories 기반 점수 계산
 * ai_tags에 포함된 키워드로 기존 키워드 매칭을 보완
 */
export function calcHealthScoreWithAi(ingredients: Ingredient[]): HealthScore {
  const aiTagSet = new Set<string>();
  const allCalories: ItemCalories[] = [];

  for (const ing of ingredients) {
    const live = ing.liveData;
    if (live?.aiTags) live.aiTags.forEach((t) => aiTagSet.add(t.toLowerCase()));
    if (live?.aiCalories) allCalories.push(live.aiCalories);
  }

  // AI 태그 기반 보정 (항산화·저GI·고단백 태그)
  const hasAntiAging = aiTagSet.has("항산화") || aiTagSet.has("비건") || aiTagSet.has("채소");
  const hasLowGi = aiTagSet.has("저gi") || aiTagSet.has("저혈당") || aiTagSet.has("통곡물");
  const hasHighProtein = aiTagSet.has("고단백") || aiTagSet.has("단백질");

  // 기본 키워드 점수
  const base = calcHealthScore(ingredients);

  // AI 태그 보정 (최대 ±0.1)
  const slowAgingBonus = hasAntiAging ? 0.08 : 0;
  const giBonus = hasLowGi ? 0.08 : 0;
  const nutritionBonus = hasHighProtein ? 0.08 : 0;

  // ai_calories 기반 영양 밸런스 재계산
  let nutritionFromAi = base.nutrition;
  if (allCalories.length > 0) {
    const avg = allCalories.reduce(
      (acc, c) => ({
        total: acc.total + c.total,
        carb: acc.carb + c.carb,
        protein: acc.protein + c.protein,
        fat: acc.fat + c.fat,
      }),
      { total: 0, carb: 0, protein: 0, fat: 0 }
    );
    const macroTotal = avg.carb + avg.protein + avg.fat;
    if (macroTotal > 0) {
      const diff =
        Math.abs(avg.protein / macroTotal - 0.3) +
        Math.abs(avg.carb / macroTotal - 0.5) +
        Math.abs(avg.fat / macroTotal - 0.2);
      nutritionFromAi = Math.max(0.1, Math.min(1, 1 - diff * 0.8));
    }
  }

  const slowAging = Math.min(1, base.slowAging + slowAgingBonus);
  const glycemicIndex = Math.min(1, base.glycemicIndex + giBonus);
  const nutrition = Math.min(1, nutritionFromAi + nutritionBonus);
  const overall = slowAging * 0.35 + glycemicIndex * 0.35 + nutrition * 0.3;

  return { slowAging, glycemicIndex, nutrition, overall };
}
