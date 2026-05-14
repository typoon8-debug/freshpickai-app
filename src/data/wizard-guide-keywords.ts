import type { CardTheme } from "@/lib/types";

export type ThemeGuide = {
  menuNamePlaceholder: string;
  commonIngredients: string[];
};

export const THEME_GUIDES: Record<CardTheme, ThemeGuide> = {
  chef_table: {
    menuNamePlaceholder: "예) 갈비찜 코스 정식",
    commonIngredients: ["소 갈비", "마늘", "생강", "간장", "설탕"],
  },
  one_meal: {
    menuNamePlaceholder: "예) 비빔밥 한그릇",
    commonIngredients: ["쌀", "달걀", "두부", "된장", "대파"],
  },
  family_recipe: {
    menuNamePlaceholder: "예) 엄마표 불고기",
    commonIngredients: ["소고기", "대파", "마늘", "간장", "참기름"],
  },
  drama_recipe: {
    menuNamePlaceholder: "예) 짜파구리 세트",
    commonIngredients: ["라면", "삼겹살", "계란", "김치"],
  },
  honwell: {
    menuNamePlaceholder: "예) 아보카도 두부 샐러드",
    commonIngredients: ["아보카도", "두부", "닭가슴살", "브로콜리", "오트밀"],
  },
  seasonal: {
    menuNamePlaceholder: "예) 제철 나물 비빔밥",
    commonIngredients: ["제철 채소", "들기름", "참깨", "간장"],
  },
  global_plate: {
    menuNamePlaceholder: "예) 크림 파스타",
    commonIngredients: ["파스타", "올리브오일", "파르메산 치즈", "마늘"],
  },
  k_dessert: {
    menuNamePlaceholder: "예) 흑임자 빙수",
    commonIngredients: ["찹쌀가루", "팥", "흑임자", "우유", "설탕"],
  },
  snack_pack: {
    menuNamePlaceholder: "예) 방과후 간식 세트",
    commonIngredients: ["떡볶이 떡", "어묵", "라면사리", "치즈"],
  },
  cinema_night: {
    menuNamePlaceholder: "예) 홈시네마 팝콘 세트",
    commonIngredients: ["팝콘 버터", "나초", "살사소스", "치즈스틱"],
  },
};

export type IngredientHint = {
  prepTip?: string;
  substitutes?: string[];
};

// fp_ingredient_meta 시드 데이터 기반 정적 손질법·대체재료 힌트
export const INGREDIENT_HINTS: Record<string, IngredientHint> = {
  양파: { prepTip: "반으로 잘라 얇게 채 썬다", substitutes: ["대파", "샬롯"] },
  마늘: { prepTip: "껍질 벗기고 다지거나 편으로 슬라이스", substitutes: ["마늘분", "아사페티다"] },
  대파: { prepTip: "흰 부분·초록 부분 분리 후 어슷썰기", substitutes: ["쪽파", "양파"] },
  생강: { prepTip: "껍질 긁어내고 곱게 다지거나 즙 내기", substitutes: ["생강분", "레몬그라스"] },
  두부: { prepTip: "키친타올로 물기 제거 후 사용", substitutes: ["연두부", "순두부"] },
  달걀: { prepTip: "실온 보관 후 사용, 흰자·노른자 분리 가능", substitutes: ["메추리알"] },
  감자: { prepTip: "껍질 벗기고 찬물에 담가 전분 제거", substitutes: ["고구마", "단호박"] },
  당근: { prepTip: "껍질 얇게 벗기고 채 썰기 또는 깍둑썰기", substitutes: ["파프리카", "호박"] },
  브로콜리: { prepTip: "송이별로 나누고 소금물에 데치기", substitutes: ["콜리플라워", "청경채"] },
  닭가슴살: { prepTip: "힘줄 제거 후 사용, 밑간 필수", substitutes: ["닭다리살", "두부"] },
  삼겹살: { prepTip: "두께 1cm로 썰어 센불에 구움", substitutes: ["목살", "돼지 앞다리"] },
  소고기: { prepTip: "핏물 제거 후 결 반대로 썰기", substitutes: ["돼지고기", "버섯(비건)"] },
  버섯: { prepTip: "흙 묻은 부분 제거, 물 세척 금지", substitutes: ["두부", "가지"] },
  쌀: { prepTip: "3회 이상 씻어 30분 불리기", substitutes: ["현미", "귀리"] },
  김치: { prepTip: "국물 짜고 잘게 썰기, 오래 묵힌 것 사용", substitutes: ["깍두기", "나박김치"] },
  간장: { prepTip: "국간장과 진간장 구분 사용", substitutes: ["조선간장", "소금물"] },
  고추장: { prepTip: "냉장 보관, 약간 희석해 사용", substitutes: ["된장+고춧가루", "스리라차"] },
  된장: { prepTip: "체에 걸러 넣으면 맑아짐", substitutes: ["미소된장", "청국장"] },
  참기름: { prepTip: "가열 금지, 마지막에 넣기", substitutes: ["들기름", "올리브오일"] },
  올리브오일: {
    prepTip: "엑스트라버진은 생으로, 일반은 볶음에 사용",
    substitutes: ["포도씨유", "해바라기유"],
  },
  파스타: { prepTip: "1% 소금물에 표기 시간보다 1분 덜 삶기", substitutes: ["우동면", "소면"] },
  치즈: { prepTip: "냉장 보관, 실온에서 꺼낸 후 사용시 향 살아남", substitutes: ["두부(비건)"] },
  버터: { prepTip: "냉장 보관 후 실온에서 부드럽게", substitutes: ["마가린", "코코넛오일"] },
  우유: { prepTip: "냉장 보관, 가열 시 넘치지 않게 주의", substitutes: ["두유", "아몬드밀크"] },
};

/**
 * 재료명에서 힌트 조회 (부분 매칭)
 * fp_ingredient_meta DB 조회 전 정적 캐시로 빠른 응답
 */
export function getIngredientHint(name: string): IngredientHint | null {
  const trimmed = name.trim();
  if (!trimmed) return null;

  // 정확한 키 매칭 우선
  if (INGREDIENT_HINTS[trimmed]) return INGREDIENT_HINTS[trimmed];

  // 부분 매칭 폴백
  const key = Object.keys(INGREDIENT_HINTS).find((k) => trimmed.includes(k) || k.includes(trimmed));
  return key ? INGREDIENT_HINTS[key] : null;
}
