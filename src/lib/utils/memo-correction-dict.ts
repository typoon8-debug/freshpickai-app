export const CORRECTION_DICT: Record<string, string> = {
  // 받침 오류
  삽겹살: "삼겹살",
  삼겹쌀: "삼겹살",
  게란: "계란",
  깍뚜기: "깍두기",
  깍뚝이: "깍두기",
  떡뽁이: "떡볶이",
  떡복이: "떡볶이",
  김치찌게: "김치찌개",
  된장찌게: "된장찌개",
  순두부찌게: "순두부찌개",
  부대찌게: "부대찌개",
  제육뽂음: "제육볶음",
  제육볶옴: "제육볶음",
  // 동의어 통일
  달걀: "계란",
  닭걀: "계란",
  // 단위·표기 변형
  오이지: "오이",
  방울토마토: "방울토마토",
  // 흔한 오탈자
  쌈장: "쌈장",
  깻잎: "깻잎",
  시금치: "시금치",
  양파: "양파",
  당근: "당근",
  감자: "감자",
  고구마: "고구마",
  돼지고기: "돼지고기",
  닭고기: "닭고기",
  소고기: "소고기",
};

/** 오탈자 사전을 이용해 품목명 내 오류 텍스트를 교정 (긴 키 우선 greedy replace) */
export function applyCorrection(name: string): string {
  const keys = Object.keys(CORRECTION_DICT).sort((a, b) => b.length - a.length);
  let result = name;
  for (const key of keys) {
    result = result.replaceAll(key, CORRECTION_DICT[key]);
  }
  return result;
}
