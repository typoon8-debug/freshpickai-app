/**
 * 재료 메타 시드 스크립트 (F018 BP3)
 * 실행: npx tsx src/scripts/seed-ingredient-meta.ts
 *
 * 주요 재료 100종에 손질법·계량 힌트·대체 재료 데이터 upsert.
 * 이미 등록된 재료는 자동 스킵 (ON CONFLICT DO NOTHING).
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("환경 변수 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

type MetaSeed = {
  name: string;
  prep_tips: string | null;
  measurement_hints: string | null;
  substitutes: string[];
};

const INGREDIENT_META: MetaSeed[] = [
  // ── 채소류 ──────────────────────────────────────────────────────────────
  {
    name: "양파",
    prep_tips:
      "껍질 벗기고 뿌리 끝 제거 후 슬라이스. 눈물 방지: 냉장 30분 후 사용하거나 물에 적신 칼 사용.",
    measurement_hints: "중간 크기 1개 ≈ 200g. 다진 양파 1컵 ≈ 160g.",
    substitutes: ["샬롯", "리크", "대파", "쪽파"],
  },
  {
    name: "마늘",
    prep_tips: "밑동 제거 후 칼 옆면으로 눌러 껍질 제거. 다지거나 슬라이스해 사용.",
    measurement_hints: "마늘 1쪽 ≈ 5g. 다진 마늘 1큰술 ≈ 15g (약 3~4쪽).",
    substitutes: ["마늘가루", "샬롯", "아시아 전통: 고추"],
  },
  {
    name: "대파",
    prep_tips: "뿌리와 겉잎 제거 후 흐르는 물에 세척. 흰 부분은 조리에, 초록 부분은 고명·육수에.",
    measurement_hints: "1대 ≈ 80g. 송송 썬 대파 1컵 ≈ 50g.",
    substitutes: ["쪽파", "부추", "리크", "양파"],
  },
  {
    name: "쪽파",
    prep_tips: "뿌리 잘라내고 전체 흐르는 물에 씻기. 생으로 고명용, 익혀서 나물·전용.",
    measurement_hints: "1단 ≈ 150g. 송송 썬 것 1/4컵 ≈ 15g.",
    substitutes: ["대파", "부추", "실파"],
  },
  {
    name: "생강",
    prep_tips: "칼 등이나 숟가락으로 껍질 긁어내기. 강판에 갈거나 얇게 슬라이스.",
    measurement_hints: "엄지 크기 1조각 ≈ 10g. 강판 간 생강 1작은술 ≈ 5g.",
    substitutes: ["생강가루 (1/4 양)", "갈랑갈", "생강청"],
  },
  {
    name: "당근",
    prep_tips: "껍질 벗기고 필요 모양으로 썰기. 볶을 때는 기름과 함께 조리해 베타카로틴 흡수 향상.",
    measurement_hints: "중간 크기 1개 ≈ 150g. 채 썬 1컵 ≈ 110g.",
    substitutes: ["파프리카", "단호박", "고구마"],
  },
  {
    name: "무",
    prep_tips: "껍질 벗기고 용도에 맞게 썰기. 육수용은 큼직하게, 깍두기용은 2cm 큐브.",
    measurement_hints: "무 1/3개 ≈ 300g. 깍둑썰기 1컵 ≈ 130g.",
    substitutes: ["순무", "콜라비", "감자 (국물용)"],
  },
  {
    name: "감자",
    prep_tips: "껍질 벗기고 썬 후 찬물에 10분 담가 전분 제거. 변색 방지: 소금물에 담그기.",
    measurement_hints: "중간 크기 1개 ≈ 200g. 깍둑썰기 1컵 ≈ 160g.",
    substitutes: ["고구마", "단호박", "토란"],
  },
  {
    name: "고구마",
    prep_tips: "껍질 벗기고 찬물에 5분 담가 전분 제거. 쪄서 으깨거나 그대로 굽기.",
    measurement_hints: "중간 크기 1개 ≈ 200g. 으깬 고구마 1컵 ≈ 240g.",
    substitutes: ["감자", "단호박", "토란"],
  },
  {
    name: "애호박",
    prep_tips: "꼭지 제거 후 흐르는 물에 씻기. 볶을 때 소금에 10분 절여 수분 제거 후 사용.",
    measurement_hints: "중간 크기 1개 ≈ 300g. 반달 썰기 1컵 ≈ 130g.",
    substitutes: ["주키니호박", "가지", "오이 (생용)"],
  },
  {
    name: "가지",
    prep_tips: "꼭지 제거 후 슬라이스. 볶기 전 소금에 10분 절여 쓴맛·수분 제거.",
    measurement_hints: "중간 크기 1개 ≈ 150g. 1cm 슬라이스 10개 ≈ 100g.",
    substitutes: ["애호박", "주키니호박", "포르토벨로 버섯"],
  },
  {
    name: "오이",
    prep_tips: "소금으로 겉면 문질러 씻기. 오이무침은 소금에 10분 절여 물기 짜기.",
    measurement_hints: "중간 크기 1개 ≈ 200g. 채 썬 1컵 ≈ 120g.",
    substitutes: ["애호박 (생용 제한)", "셀러리", "여름무"],
  },
  {
    name: "브로콜리",
    prep_tips: "송이 단위로 나눠 소금물에 5분 담가 벌레 제거. 줄기도 껍질 벗기면 식용 가능.",
    measurement_hints: "중간 크기 1송이 ≈ 400g. 먹기 좋게 나눈 1컵 ≈ 90g.",
    substitutes: ["콜리플라워", "케일", "양배추"],
  },
  {
    name: "시금치",
    prep_tips:
      "뿌리 끝 제거 후 흐르는 물에 여러 번 씻기. 데칠 때 끓는 소금물에 30초, 찬물에 헹구기.",
    measurement_hints: "생 1단 ≈ 200g. 데친 시금치 1컵 ≈ 170g.",
    substitutes: ["근대", "청경채", "케일", "아욱"],
  },
  {
    name: "배추",
    prep_tips: "겉잎 2~3장 제거 후 용도별 썰기. 김치용은 4등분 후 소금에 절이기.",
    measurement_hints: "중간 크기 1/4통 ≈ 600g. 썬 배추 1컵 ≈ 70g.",
    substitutes: ["양배추", "청경채", "로메인"],
  },
  {
    name: "양배추",
    prep_tips: "겉잎 제거 후 4등분. 채 썰기 전 심지 V자로 제거.",
    measurement_hints: "중간 크기 1/4통 ≈ 350g. 채 썬 1컵 ≈ 70g.",
    substitutes: ["배추", "청경채", "콜라비"],
  },
  {
    name: "깻잎",
    prep_tips: "꼭지 제거 후 찬물에 흔들어 씻기. 쌈용은 그대로, 무침용은 채 썰기.",
    measurement_hints: "깻잎 10장 ≈ 20g. 채 썬 1컵 ≈ 30g.",
    substitutes: ["상추", "치커리", "부추"],
  },
  {
    name: "상추",
    prep_tips: "낱장 분리 후 찬물에 담가 흙 제거. 찬물에 10분 두면 아삭해짐.",
    measurement_hints: "상추 10장 ≈ 50g.",
    substitutes: ["깻잎", "로메인", "치커리"],
  },
  {
    name: "부추",
    prep_tips: "뿌리 끝 1cm 제거 후 여러 번 씻기. 볶을 때 마지막에 넣어 과익 방지.",
    measurement_hints: "1단 ≈ 100g. 송송 썬 1컵 ≈ 60g.",
    substitutes: ["쪽파", "파 (초록 부분)", "마늘종"],
  },
  {
    name: "콩나물",
    prep_tips: "꼬리 제거 (선택), 흐르는 물에 씻기. 뚜껑 닫고 조리해 비린내 방지.",
    measurement_hints: "1봉지 ≈ 200g. 익은 콩나물 1컵 ≈ 100g.",
    substitutes: ["숙주나물", "시금치", "팽이버섯"],
  },
  {
    name: "숙주나물",
    prep_tips: "꼬리 제거 후 씻기. 끓는 물에 30초만 데쳐 아삭함 유지.",
    measurement_hints: "1봉지 ≈ 200g. 데친 것 1컵 ≈ 90g.",
    substitutes: ["콩나물", "시금치", "미나리"],
  },
  {
    name: "토마토",
    prep_tips: "꼭지 제거 후 씻기. 껍질 제거: 십자 칼집 후 끓는 물 30초, 찬물에 담그기.",
    measurement_hints: "중간 크기 1개 ≈ 150g. 깍둑썰기 1컵 ≈ 180g.",
    substitutes: ["방울토마토", "토마토소스 (볶음용)", "파프리카 (샐러드용)"],
  },
  {
    name: "파프리카",
    prep_tips: "꼭지·씨·속 제거 후 용도별 썰기. 색상별로 단맛·영양 조금씩 다름.",
    measurement_hints: "중간 크기 1개 ≈ 180g. 슬라이스 1컵 ≈ 100g.",
    substitutes: ["피망", "당근 (색감)", "토마토"],
  },
  {
    name: "피망",
    prep_tips: "꼭지·씨·속 제거 후 채 썰기. 볶음 전 기름에 먼저 달구기.",
    measurement_hints: "중간 크기 1개 ≈ 150g. 채 썬 1컵 ≈ 90g.",
    substitutes: ["파프리카", "청양고추 (양 조절)", "애호박"],
  },
  {
    name: "표고버섯",
    prep_tips: "기둥 제거 후 젖은 키친타월로 닦기 (물에 씻으면 향 손실). 말린 것은 미온수에 30분.",
    measurement_hints: "생 중간 크기 3개 ≈ 100g. 슬라이스 1컵 ≈ 70g.",
    substitutes: ["새송이버섯", "느타리버섯", "건표고버섯 (1/4 양)"],
  },
  {
    name: "팽이버섯",
    prep_tips: "뿌리 3cm 잘라내고 낱개로 분리 후 씻기. 국·전골에 넣을 때 마지막에 투입.",
    measurement_hints: "1봉지 ≈ 150g. 뿌리 제거 후 1컵 ≈ 50g.",
    substitutes: ["새송이버섯", "느타리버섯", "콩나물"],
  },
  {
    name: "느타리버섯",
    prep_tips: "밑동 제거 후 손으로 찢어 사용. 물에 살짝만 씻고 수분 최소화.",
    measurement_hints: "1팩 ≈ 200g. 손으로 찢어 1컵 ≈ 60g.",
    substitutes: ["새송이버섯", "표고버섯", "팽이버섯"],
  },
  {
    name: "새송이버섯",
    prep_tips: "밑동 제거 후 세로 슬라이스 또는 어슷 썰기. 기름에 굽거나 조림에 적합.",
    measurement_hints: "중간 크기 2개 ≈ 200g. 슬라이스 1컵 ≈ 80g.",
    substitutes: ["포르토벨로 버섯", "표고버섯", "느타리버섯"],
  },
  {
    name: "연근",
    prep_tips: "껍질 벗기고 슬라이스 후 식초물에 담가 갈변 방지. 조림 시 먼저 데쳐 아린 맛 제거.",
    measurement_hints: "연근 1마디 ≈ 200g. 슬라이스 1컵 ≈ 130g.",
    substitutes: ["우엉", "감자 (조림용)"],
  },
  {
    name: "우엉",
    prep_tips: "칼 등으로 껍질 긁어내고 어슷 썰기 후 식초물에 담가 갈변 방지.",
    measurement_hints: "1줄기 ≈ 150g. 어슷 썬 1컵 ≈ 100g.",
    substitutes: ["연근", "당근", "도라지"],
  },
  // ── 쌈채소·나물 ──────────────────────────────────────────────────────────
  {
    name: "미나리",
    prep_tips: "뿌리·노란 잎 제거 후 흐르는 물에 씻기. 데치면 쓴맛 사라짐.",
    measurement_hints: "1단 ≈ 150g. 4cm 썰어 1컵 ≈ 50g.",
    substitutes: ["시금치", "파슬리", "쑥갓"],
  },
  {
    name: "쑥갓",
    prep_tips: "굵은 줄기 제거 후 잎 위주로 사용. 향이 강해 적은 양부터 사용.",
    measurement_hints: "1단 ≈ 100g. 잎 1컵 ≈ 30g.",
    substitutes: ["미나리", "깻잎", "바질"],
  },
  {
    name: "고사리",
    prep_tips: "삶아 말린 것은 찬물에 하룻밤 불린 후 끓는 물에 20분 더 삶기.",
    measurement_hints: "마른 고사리 50g → 불린 후 약 200g.",
    substitutes: ["고비", "취나물", "도라지"],
  },
  {
    name: "도라지",
    prep_tips: "껍질 벗기고 소금에 주물러 쓴맛 제거. 무침 전 3분 정도 데치기.",
    measurement_hints: "생 도라지 1컵 ≈ 100g.",
    substitutes: ["우엉", "연근", "더덕"],
  },
  // ── 고추류 ──────────────────────────────────────────────────────────────
  {
    name: "청양고추",
    prep_tips: "꼭지 제거 후 어슷 썰기. 씨 제거하면 매운맛 30% 감소.",
    measurement_hints: "1개 ≈ 10g. 송송 썬 1큰술 ≈ 10g.",
    substitutes: ["홍고추", "할라피뇨", "고추가루 (양 조절)"],
  },
  {
    name: "홍고추",
    prep_tips: "꼭지·씨 제거 후 어슷 썰기. 색감 연출에 주로 사용.",
    measurement_hints: "1개 ≈ 15g. 어슷 썬 1큰술 ≈ 10g.",
    substitutes: ["파프리카 (매운맛 없음)", "청양고추 (더 매움)"],
  },
  // ── 단백질류 ─────────────────────────────────────────────────────────────
  {
    name: "두부",
    prep_tips: "키친타월로 눌러 수분 제거 10분. 부침용은 소금 살짝 뿌려 5분 후 닦기.",
    measurement_hints: "1모 ≈ 300g. 깍둑썰기 1컵 ≈ 150g.",
    substitutes: ["순두부", "연두부", "달걀 (단백질 대체)", "콩비지"],
  },
  {
    name: "순두부",
    prep_tips: "봉지째 뜯어 덜기. 뜨거운 국물에 숟가락으로 떠 넣기.",
    measurement_hints: "1봉 ≈ 300g. 1인분 ≈ 150g.",
    substitutes: ["연두부", "두부 (질감 다름)", "계란 흰자"],
  },
  {
    name: "계란",
    prep_tips: "사용 전 실온에 30분 두면 껍질 제거 쉬움. 삶은 계란: 끓는 물 12분 후 찬물.",
    measurement_hints: "중란 1개 ≈ 60g (껍질 제외 50g). 달걀물 1개 ≈ 3큰술.",
    substitutes: ["아마씨 물 (1큰술+물3큰술)", "두부 (부침)", "달걀 대체품"],
  },
  {
    name: "닭가슴살",
    prep_tips: "힘줄 제거 후 포크로 찌르거나 두들겨 두께 균일하게. 삶을 때 냉수에서 시작.",
    measurement_hints: "1조각 ≈ 150~200g.",
    substitutes: ["닭다리살", "두부", "새우 (볶음류)"],
  },
  {
    name: "닭다리살",
    prep_tips: "껍질·지방 제거 후 원하는 크기로 썰기. 간장·생강 마리네이드 30분 권장.",
    measurement_hints: "뼈 없는 1조각 ≈ 200g.",
    substitutes: ["닭가슴살", "돼지 앞다리살", "두부 (채식)"],
  },
  {
    name: "돼지고기",
    prep_tips: "핏물 제거: 우유 또는 청주에 30분 재우기. 결 반대 방향으로 썰면 부드러움.",
    measurement_hints: "불고기용 1인분 ≈ 150g. 다진 고기 1컵 ≈ 250g.",
    substitutes: ["소고기", "닭다리살", "두부 (채식)"],
  },
  {
    name: "소고기",
    prep_tips: "조리 30분 전 실온 보관. 핏물 제거 후 소금·후추 마리네이드.",
    measurement_hints: "불고기용 1인분 ≈ 150g. 다진 소고기 1컵 ≈ 250g.",
    substitutes: ["돼지고기", "버섯 (채식 불고기)", "두부"],
  },
  {
    name: "삼겹살",
    prep_tips: "냉장 상태에서 0.5cm 슬라이스. 팬 달구기 후 기름 없이 구움.",
    measurement_hints: "1인분 ≈ 200g (약 3~4장).",
    substitutes: ["목살", "항정살", "베이컨"],
  },
  {
    name: "멸치",
    prep_tips: "국물용: 볶음팬에 기름 없이 2분 볶아 비린내 제거. 조림용: 그대로 사용.",
    measurement_hints: "육수용 큰 멸치 10마리 ≈ 20g. 볶음용 작은 멸치 1컵 ≈ 50g.",
    substitutes: ["다시마 (육수용)", "새우가루", "다시다 (조미용)"],
  },
  {
    name: "오징어",
    prep_tips: "내장·먹물 제거 후 껍질 벗기기. 칼집 넣으면 오그라들지 않음. 과익 주의.",
    measurement_hints: "손질 후 1마리 ≈ 200g.",
    substitutes: ["갑오징어", "쭈꾸미", "낙지"],
  },
  {
    name: "새우",
    prep_tips: "등쪽 두 번째 마디에 이쑤시개 찔러 내장 제거. 칵테일새우는 해동 후 물기 제거.",
    measurement_hints: "중간 크기 10마리 ≈ 150g. 손질 후 1컵 ≈ 100g.",
    substitutes: ["오징어", "게맛살", "두부 (채식)"],
  },
  {
    name: "바지락",
    prep_tips: "소금물(물 1L+소금 2큰술)에 1시간 해감. 조리 전 껍데기 맞부딪쳐 죽은 것 제거.",
    measurement_hints: "1봉지 ≈ 400g. 해감 후 국물용 1인분 ≈ 100g.",
    substitutes: ["모시조개", "동죽", "홍합"],
  },
  {
    name: "황태",
    prep_tips: "찬물에 30분 불려 부드럽게. 국용은 적당히 찢어 사용.",
    measurement_hints: "1마리 ≈ 80g (건). 불린 후 약 200g.",
    substitutes: ["북어", "명태 (신선)", "다시마 (국물)"],
  },
  {
    name: "어묵",
    prep_tips: "끓는 물에 30초 데쳐 기름기 제거. 어묵탕은 육수에 직접 넣기.",
    measurement_hints: "사각어묵 1장 ≈ 100g.",
    substitutes: ["두부", "게맛살", "쫄면 (볶음)"],
  },
  // ── 곡물·면류 ────────────────────────────────────────────────────────────
  {
    name: "쌀",
    prep_tips: "3~4회 씻어 30분 불리면 밥맛 좋아짐. 물 비율: 쌀:물 = 1:1.2.",
    measurement_hints: "쌀 1컵 ≈ 180g. 1인분 ≈ 150g (건조).",
    substitutes: ["현미 (식감 다름)", "찹쌀", "퀴노아 (건강식)"],
  },
  {
    name: "찹쌀",
    prep_tips: "최소 2시간 불리기. 물 비율: 쌀보다 적게 1:1.",
    measurement_hints: "1컵 ≈ 180g.",
    substitutes: ["쌀 (찰기 감소)", "찹쌀가루"],
  },
  {
    name: "밀가루",
    prep_tips: "체에 한 번 내려 공기 넣기. 계량 시 스푼으로 퍼서 평평하게 깎기.",
    measurement_hints: "1컵 ≈ 120g (박력분). 1큰술 ≈ 8g.",
    substitutes: ["쌀가루 (글루텐프리)", "감자전분", "부침가루 (조미 포함)"],
  },
  {
    name: "당면",
    prep_tips: "뜨거운 물에 30분 불리거나 끓는 물에 7분 삶기. 찬물에 헹궈 물기 제거.",
    measurement_hints: "건 당면 50g → 삶은 후 약 150g. 1인분 ≈ 50g (건).",
    substitutes: ["쌀국수", "우동면 (식감 다름)", "곤약면 (저칼로리)"],
  },
  {
    name: "쌀국수",
    prep_tips: "찬물에 30분 불린 후 끓는 물에 2~3분만 삶기. 너무 익히면 뭉침.",
    measurement_hints: "건 100g → 삶은 후 약 250g.",
    substitutes: ["당면", "소면", "곤약면"],
  },
  // ── 소스·양념류 ──────────────────────────────────────────────────────────
  {
    name: "간장",
    prep_tips: "조림용은 진간장, 국·나물용은 국간장, 생채용은 양조간장.",
    measurement_hints: "1큰술 ≈ 15ml ≈ 17g. 1작은술 ≈ 5ml.",
    substitutes: ["국간장 (더 짬)", "소금 (1큰술→1/2작은술)", "타마리 (글루텐프리)"],
  },
  {
    name: "된장",
    prep_tips: "찌개용은 체에 풀어서 사용. 쌈장 만들 때 고추장과 1:1.",
    measurement_hints: "1큰술 ≈ 18g.",
    substitutes: ["청국장 (맛 강함)", "미소된장 (일식용)"],
  },
  {
    name: "고추장",
    prep_tips: "볶을 때는 기름에 먼저 볶아 감칠맛 향상. 냉장 보관 필수.",
    measurement_hints: "1큰술 ≈ 18g.",
    substitutes: ["된장+고춧가루", "사리라차 소스 (다른 풍미)"],
  },
  {
    name: "참기름",
    prep_tips: "조리 마지막에 넣어 향 보존. 가열하면 향 감소.",
    measurement_hints: "1큰술 ≈ 13ml. 나물 1인분 기준 1/2~1작은술.",
    substitutes: ["들기름", "포도씨유+볶은깨"],
  },
  {
    name: "들기름",
    prep_tips: "나물 볶을 때 기름으로 사용. 산패 빠르니 냉장 보관.",
    measurement_hints: "1큰술 ≈ 13ml.",
    substitutes: ["참기름", "해바라기씨유"],
  },
  {
    name: "고춧가루",
    prep_tips: "거칠거나 고운 것 구분해 사용. 소금에 절인 재료와 먼저 섞어 색 빼기.",
    measurement_hints: "1큰술 ≈ 8g. 1작은술 ≈ 3g.",
    substitutes: ["파프리카 가루+카이엔 (맛 조절)", "칠리 플레이크"],
  },
  {
    name: "설탕",
    prep_tips: "조림 초반에 넣어 재료에 단맛 스며들게 하기.",
    measurement_hints: "1큰술 ≈ 12g. 1작은술 ≈ 4g.",
    substitutes: ["꿀 (0.75배)", "올리고당", "매실청"],
  },
  {
    name: "소금",
    prep_tips: "꽃소금은 간용, 굵은소금은 절임·삶을 때. 첫 간은 적게 넣고 조절.",
    measurement_hints: "1작은술 ≈ 5g. 1큰술 ≈ 15g.",
    substitutes: ["국간장 (5배 양)", "피쉬소스 (감칠맛 추가)"],
  },
  {
    name: "식초",
    prep_tips: "드레싱엔 사과식초·현미식초, 초무침엔 양조식초.",
    measurement_hints: "1큰술 ≈ 15ml.",
    substitutes: ["레몬즙 (1.5배)", "유자청", "청매실청"],
  },
  {
    name: "맛술",
    prep_tips: "재료 볶은 후 넣어 알코올 날리기. 고기 잡내 제거 효과.",
    measurement_hints: "1큰술 ≈ 15ml.",
    substitutes: ["청주+설탕 (1:0.5)", "생강즙", "사과즙"],
  },
  {
    name: "청주",
    prep_tips: "생선·고기 초벌 마리네이드에 사용. 가열 시 알코올 날아감.",
    measurement_hints: "1큰술 ≈ 15ml.",
    substitutes: ["맛술", "화이트와인", "생강즙+물"],
  },
  {
    name: "굴소스",
    prep_tips: "짠맛 강하니 간장 줄이기. 볶음 마지막에 넣어 향 보존.",
    measurement_hints: "1큰술 ≈ 18g.",
    substitutes: ["비건: 표고버섯 분말+간장", "우스터소스 (맛 다름)"],
  },
  {
    name: "쌈장",
    prep_tips: "된장:고추장=1:1, 다진 마늘·참기름 추가로 직접 만들기 가능.",
    measurement_hints: "1인분 기준 1~2큰술.",
    substitutes: ["된장+고추장 직접 혼합", "고추장"],
  },
  // ── 유제품·달걀 ──────────────────────────────────────────────────────────
  {
    name: "우유",
    prep_tips: "소스용은 상온에서 사용. 냄새 제거용(고기 재우기)은 냉장 그대로.",
    measurement_hints: "1컵 ≈ 240ml.",
    substitutes: ["두유", "오트밀크", "코코넛밀크 (풍미 강함)"],
  },
  {
    name: "치즈",
    prep_tips: "실온 30분 두면 녹이기 쉬움. 슬라이스는 구이 마지막, 가루는 완성 후 뿌리기.",
    measurement_hints: "슬라이스 1장 ≈ 20g. 가루 치즈 1큰술 ≈ 8g.",
    substitutes: ["두부 페타 (채식)", "영양효모 (풍미)"],
  },
  {
    name: "버터",
    prep_tips: "실온에서 부드럽게 후 사용. 태우지 않게 중불 이하.",
    measurement_hints: "1큰술 ≈ 14g. 1/4컵 ≈ 57g.",
    substitutes: ["식물성 버터", "코코넛오일", "올리브오일 (0.75배)"],
  },
  // ── 기름류 ───────────────────────────────────────────────────────────────
  {
    name: "올리브오일",
    prep_tips: "발연점 낮아 고온 조리 부적합. 드레싱·마무리용으로 최적.",
    measurement_hints: "1큰술 ≈ 13ml.",
    substitutes: ["아보카도오일 (고온)", "포도씨유", "해바라기씨유"],
  },
  {
    name: "식용유",
    prep_tips: "발연점 높아 튀김·볶음에 적합. 냄새 없어 다목적 사용 가능.",
    measurement_hints: "1큰술 ≈ 13ml.",
    substitutes: ["카놀라유", "해바라기씨유", "포도씨유"],
  },
  {
    name: "통깨",
    prep_tips: "마른 팬에 약불로 살짝 볶으면 향 강해짐. 마무리 고명으로 뿌리기.",
    measurement_hints: "1작은술 ≈ 3g. 1큰술 ≈ 9g.",
    substitutes: ["깨소금", "들깨", "볶은 호박씨"],
  },
  // ── 해산물·수산가공 ──────────────────────────────────────────────────────
  {
    name: "굴",
    prep_tips: "무즙에 씻어 잡맛 제거. 살짝만 익혀 식감 유지.",
    measurement_hints: "1팩 ≈ 200g (손질). 1인분 ≈ 100g.",
    substitutes: ["바지락", "홍합", "새우"],
  },
  {
    name: "홍합",
    prep_tips: "수염(족사) 잡아당겨 제거. 소금물에 30분 해감.",
    measurement_hints: "1봉지 ≈ 300g. 국물용 1인분 ≈ 100g.",
    substitutes: ["바지락", "모시조개", "새우"],
  },
  {
    name: "참치",
    prep_tips: "캔 참치는 기름 또는 물 완전히 따라내기. 생참치는 슬라이스 후 소금·레몬.",
    measurement_hints: "참치캔 1개 ≈ 150g (건지). 1인분 ≈ 50~80g.",
    substitutes: ["연어 (구이·회)", "고등어캔", "닭가슴살 (볶음)"],
  },
  {
    name: "고등어",
    prep_tips: "소금 뿌려 15분 후 씻기. 생강즙·청주로 잡내 제거.",
    measurement_hints: "중간 크기 1마리 ≈ 350g (손질 전). 1인분 ≈ 1/2마리.",
    substitutes: ["삼치", "갈치", "연어"],
  },
  {
    name: "연어",
    prep_tips: "냉동 연어는 냉장에서 하룻밤 해동. 소금+레몬 30분 마리네이드 후 구이.",
    measurement_hints: "1인분 ≈ 150~200g (필레).",
    substitutes: ["참치 (구이)", "송어", "고등어"],
  },
  {
    name: "낙지",
    prep_tips: "밀가루+소금으로 주물러 씻기. 내장·먹물 제거. 너무 오래 익히면 질겨짐.",
    measurement_hints: "손질 후 1마리 ≈ 200g.",
    substitutes: ["쭈꾸미", "오징어", "문어"],
  },
  {
    name: "쭈꾸미",
    prep_tips: "밀가루로 주물러 씻고 먹물 제거. 끓는 물에 1분만 데치기.",
    measurement_hints: "손질 후 1팩 ≈ 300g.",
    substitutes: ["낙지", "오징어"],
  },
  // ── 가공식품 ─────────────────────────────────────────────────────────────
  {
    name: "햄",
    prep_tips: "슬라이스 후 기름 없이 굽거나 끓는 물에 살짝 데쳐 염분 줄이기.",
    measurement_hints: "슬라이스 3장 ≈ 60g.",
    substitutes: ["소시지", "베이컨", "두부"],
  },
  {
    name: "마요네즈",
    prep_tips: "드레싱 기준: 마요:설탕:식초=3:1:1. 냉장 보관·사용 직전 꺼내기.",
    measurement_hints: "1큰술 ≈ 14g.",
    substitutes: ["그릭요거트+레몬 (저칼로리)", "아보카도 (디핑)"],
  },
  {
    name: "케첩",
    prep_tips: "볶음 소스 기준: 케첩:간장:굴소스=2:1:0.5.",
    measurement_hints: "1큰술 ≈ 15g.",
    substitutes: ["토마토소스+설탕", "하인즈 토마토 퓨레+식초"],
  },
  // ── 전분·가루류 ──────────────────────────────────────────────────────────
  {
    name: "녹말가루",
    prep_tips: "물에 개어 사용. 소스 농도 조절: 물:녹말=2:1 비율.",
    measurement_hints: "1큰술 ≈ 8g.",
    substitutes: ["감자전분", "쌀가루", "밀가루 (2배 양)"],
  },
  {
    name: "쌀가루",
    prep_tips: "물에 개어 전병·전용 반죽. 글루텐 없어 바삭한 식감.",
    measurement_hints: "1컵 ≈ 130g.",
    substitutes: ["밀가루 (촉촉해짐)", "감자전분 (바삭함 유지)"],
  },
  {
    name: "부침가루",
    prep_tips: "물과 1:1 비율. 달걀 추가하면 더 바삭. 차가운 물 사용 권장.",
    measurement_hints: "1컵 ≈ 120g.",
    substitutes: ["밀가루+소금+후추", "쌀가루+소금"],
  },
  // ── 두부·콩류 ─────────────────────────────────────────────────────────────
  {
    name: "콩",
    prep_tips: "하룻밤 물에 불린 후 삶기. 압력밥솥 이용 시 30분 단축.",
    measurement_hints: "건 1컵 ≈ 185g → 불린 후 2배 이상.",
    substitutes: ["검은콩", "병아리콩", "렌틸콩"],
  },
  {
    name: "검은콩",
    prep_tips: "하룻밤 물에 불린 후 조림 또는 밥에 넣기. 안토시아닌 보존 위해 식초 1작은술 추가.",
    measurement_hints: "건 1컵 ≈ 185g.",
    substitutes: ["콩", "병아리콩"],
  },
  // ── 해조류 ──────────────────────────────────────────────────────────────
  {
    name: "다시마",
    prep_tips: "젖은 행주로 닦기 (씻으면 감칠맛 손실). 찬물에 30분 우리거나 약불로 10분.",
    measurement_hints: "10cm x 10cm 1장 ≈ 10g. 육수용 5x5 2~3장.",
    substitutes: ["멸치 (동물성 감칠맛)", "표고버섯 (채식 육수)"],
  },
  {
    name: "김",
    prep_tips: "불에 살짝 구워 향 살리기. 직접 불꽃 주의.",
    measurement_hints: "전장 1장 ≈ 3g. 조미김 1팩 ≈ 5g.",
    substitutes: ["참기름+소금 뿌린 파래"],
  },
  {
    name: "미역",
    prep_tips: "마른 미역은 찬물에 20분 불리기. 미역국은 참기름에 먼저 볶기.",
    measurement_hints: "건 미역 10g → 불린 후 약 60g.",
    substitutes: ["다시마 (국물)", "매생이"],
  },
  // ── 기타 ────────────────────────────────────────────────────────────────
  {
    name: "두반장",
    prep_tips: "기름에 볶아 매운맛·향 살리기. 짠맛 강해 간장 양 조절.",
    measurement_hints: "1큰술 ≈ 18g.",
    substitutes: ["고추장+된장 (1:1)", "사리라차+미소"],
  },
  {
    name: "올리고당",
    prep_tips: "설탕 대신 사용 시 1.2배 양. 가열해도 감미도 유지.",
    measurement_hints: "1큰술 ≈ 21g.",
    substitutes: ["꿀", "물엿", "아가베 시럽"],
  },
  {
    name: "매실청",
    prep_tips: "신맛·단맛 동시에. 초무침·드레싱에 설탕+식초 대신 사용.",
    measurement_hints: "1큰술 ≈ 20g.",
    substitutes: ["설탕+식초", "청포도주스", "유자청"],
  },
  {
    name: "들깨",
    prep_tips: "마른 팬에 약불로 볶아 사용. 갈아서 들깨가루로 조리.",
    measurement_hints: "들깨가루 1큰술 ≈ 8g.",
    substitutes: ["참깨", "흑임자", "아마씨"],
  },
  {
    name: "참나물",
    prep_tips: "굵은 줄기 제거 후 끓는 물에 30초 데쳐 찬물 헹구기.",
    measurement_hints: "1단 ≈ 100g.",
    substitutes: ["미나리", "쑥갓", "시금치"],
  },
  {
    name: "후추",
    prep_tips: "조리 마지막에 넣어 향 보존. 통후추 갈면 향 10배 이상 강해짐.",
    measurement_hints: "1작은술 ≈ 2g.",
    substitutes: ["백후추 (색 다름)", "산초가루"],
  },
  {
    name: "마늘종",
    prep_tips: "5cm 길이로 썰어 볶거나 장아찌로. 끝부분 제거.",
    measurement_hints: "1단 ≈ 150g.",
    substitutes: ["부추", "아스파라거스", "쪽파"],
  },
  {
    name: "단호박",
    prep_tips: "전자레인지 5분 돌리면 껍질 벗기기 쉬움. 씨와 섬유질 제거 후 사용.",
    measurement_hints: "중간 크기 1/4개 ≈ 300g.",
    substitutes: ["고구마", "감자", "버터넛 스쿼시"],
  },
  {
    name: "열무",
    prep_tips: "뿌리 제거 후 소금에 절여 물기 빼기. 열무김치는 5cm 길이로 썰기.",
    measurement_hints: "1단 ≈ 400g.",
    substitutes: ["총각무", "무청", "시금치"],
  },
  {
    name: "베이킹파우더",
    prep_tips: "밀가루와 체에 함께 내려 골고루 섞기. 습기에 약하니 밀폐 보관.",
    measurement_hints: "1작은술 ≈ 4g.",
    substitutes: ["베이킹소다 (1/3 양)", "탄산수 사용"],
  },
  {
    name: "전분",
    prep_tips: "물에 녹인 후 사용. 1큰술 전분+2큰술 물로 소스 농도 조절.",
    measurement_hints: "1큰술 ≈ 10g.",
    substitutes: ["밀가루 (2배 양)", "쌀가루", "타피오카 전분"],
  },
];

async function seed() {
  console.log(`\n[fp_ingredient_meta] 재료 메타 시드 시작 (${INGREDIENT_META.length}종)...\n`);

  let successCount = 0;
  const skipCount = 0;
  let errorCount = 0;

  const BATCH_SIZE = 20;
  for (let i = 0; i < INGREDIENT_META.length; i += BATCH_SIZE) {
    const batch = INGREDIENT_META.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("fp_ingredient_meta")
      .upsert(batch, { onConflict: "name", ignoreDuplicates: true });

    if (error) {
      console.error(`  배치 ${Math.floor(i / BATCH_SIZE) + 1} 오류:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(
        `  배치 ${Math.floor(i / BATCH_SIZE) + 1} 완료: ${batch.map((m) => m.name).join(", ")}`
      );
    }
  }

  // 시드 결과 확인
  const { count } = await supabase
    .from("fp_ingredient_meta")
    .select("*", { count: "exact", head: true });

  console.log(`\n✅ 시드 완료`);
  console.log(`  - 처리: ${successCount}종 (중복은 자동 스킵)`);
  if (errorCount > 0) console.log(`  - 오류: ${errorCount}종`);
  console.log(`  - DB 총 레코드 수: ${count}종`);
  console.log(`  - 스킵(이미 존재): ${skipCount}종`);
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("시드 실패:", e);
    process.exit(1);
  });
