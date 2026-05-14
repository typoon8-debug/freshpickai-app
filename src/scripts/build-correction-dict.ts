/**
 * ETL 파이프라인: 오타 보정 사전 빌드 스크립트
 *
 * 실행: npx tsx src/scripts/build-correction-dict.ts
 *
 * 동작:
 *   1. src/data/correction-dict/dict.json 읽기
 *   2. 6단계 검증 (충돌·순환·자모거리·재귀안정성·금칙어·identity)
 *   3. (선택) ETL 소스 병합 — 아래 loadEtlSource() 구현 후 활성화
 *   4. 검증 통과 엔트리를 dict.json 에 다시 저장
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// ── 경로 설정 ────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../");
const DICT_PATH = path.join(ROOT, "src/data/correction-dict/dict.json");
const ALLOWLIST_PATH = path.join(ROOT, "src/data/correction-dict/domain-allowlist.txt");

// ── 타입 ─────────────────────────────────────────────────────
type Source = "manual" | "etl" | "user_feedback";
interface DictEntry {
  wrong: string;
  correct: string;
  source: Source;
}

interface ValidationReport {
  total: number;
  passed: number;
  removed: number;
  warnings: string[];
  errors: string[];
}

// ── 유틸 ─────────────────────────────────────────────────────

/** 한글 자모 분리 (초성·중성·종성) */
function decomposeHangul(char: string): number[] {
  const code = char.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return [char.charCodeAt(0)];
  const cho = Math.floor(code / 28 / 21);
  const jung = Math.floor((code / 28) % 21);
  const jong = code % 28;
  return [cho, jung, jong];
}

/** 두 한글 문자열 간 자모 편집 거리 추정 (낮을수록 유사) */
function jamoDistance(a: string, b: string): number {
  let dist = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const ca = decomposeHangul(a[i] ?? "");
    const cb = decomposeHangul(b[i] ?? "");
    dist += ca.filter((v, idx) => v !== cb[idx]).length;
  }
  return dist;
}

// ── 6단계 검증 ───────────────────────────────────────────────

function validate(entries: DictEntry[]): { valid: DictEntry[]; report: ValidationReport } {
  const report: ValidationReport = {
    total: entries.length,
    passed: 0,
    removed: 0,
    warnings: [],
    errors: [],
  };

  const valid: DictEntry[] = [];
  const wrongIndex = new Map<string, DictEntry>();
  const correctSet = new Set(entries.map((e) => e.correct));

  for (const entry of entries) {
    let ok = true;

    // STEP 1: identity — wrong === correct 는 불필요 엔트리
    if (entry.wrong === entry.correct) {
      report.warnings.push(`[identity] "${entry.wrong}" — wrong === correct, 스킵`);
      ok = false;
    }

    // STEP 2: 충돌 — 동일 wrong 에 다른 correct
    if (ok) {
      const prev = wrongIndex.get(entry.wrong);
      if (prev && prev.correct !== entry.correct) {
        report.errors.push(
          `[충돌] "${entry.wrong}" → "${prev.correct}" vs "${entry.correct}", 첫 번째 유지`
        );
        ok = false;
      }
    }

    // STEP 3: 순환 — A→B 이고 B→A 인 경우
    if (ok) {
      const reverse = entries.find((e) => e.wrong === entry.correct && e.correct === entry.wrong);
      if (reverse) {
        report.errors.push(`[순환] "${entry.wrong}"↔"${entry.correct}" 쌍방 순환 감지`);
        ok = false;
      }
    }

    // STEP 4: 재귀 안정성 — correct 가 다른 wrong 에 등록된 경우 체인 경고
    if (ok && correctSet.has(entry.wrong)) {
      // wrong 이 다른 엔트리의 correct 면 이미 바른 표현이 들어온 것 → 경고만
      report.warnings.push(
        `[재귀경고] "${entry.wrong}" 은 다른 엔트리의 correct 이기도 함 — 체인 가능성`
      );
    }

    // STEP 5: 자모거리 — 편집거리 0 (완전 동일 단어)는 이미 identity 로 걸러짐
    //          너무 큰 자모거리(>6)는 의미 없는 매핑일 수 있어 경고
    if (ok && jamoDistance(entry.wrong, entry.correct) > 6) {
      report.warnings.push(
        `[자모거리] "${entry.wrong}"→"${entry.correct}" 편집거리가 큼 (>6), 확인 필요`
      );
    }

    // STEP 6: 금칙어 — wrong/correct 에 공백만 있거나 1글자 미만
    if (ok && (entry.wrong.trim().length === 0 || entry.correct.trim().length === 0)) {
      report.errors.push(`[금칙어] 빈 문자열 엔트리: "${entry.wrong}"→"${entry.correct}"`);
      ok = false;
    }

    if (ok) {
      wrongIndex.set(entry.wrong, entry);
      valid.push(entry);
    } else {
      report.removed++;
    }
  }

  report.passed = valid.length;
  return { valid, report };
}

// ── ETL 소스 로더 (확장 포인트) ──────────────────────────────

/**
 * 외부 공개 데이터셋에서 추가 엔트리 로드.
 * 현재는 stub — 실제 데이터셋 URL 확보 후 구현.
 *
 * 예시 소스:
 *   - 국립국어원 표준어 목록 CSV
 *   - 농수산물 표준코드 JSON
 *   - user_feedback 테이블 집계 결과
 */
async function loadEtlSource(): Promise<DictEntry[]> {
  // TODO: 실제 ETL 구현 시 아래를 활성화
  // const res = await fetch('https://example.com/food-typos.csv');
  // const text = await res.text();
  // return parseCsv(text).map(row => ({ wrong: row[0], correct: row[1], source: 'etl' }));
  return [];
}

// ── 메인 ─────────────────────────────────────────────────────

async function main() {
  console.log("=== FreshPickAI 오타 보정 사전 ETL ===\n");

  // 1. 기존 dict.json 읽기
  const raw = fs.readFileSync(DICT_PATH, "utf-8");
  const existing: DictEntry[] = JSON.parse(raw);
  console.log(`기존 엔트리: ${existing.length}개`);

  // 2. ETL 소스 병합
  const etlEntries = await loadEtlSource();
  if (etlEntries.length > 0) {
    console.log(`ETL 소스에서 ${etlEntries.length}개 추가`);
  }
  const merged = [...existing, ...etlEntries];

  // 3. 도메인 allowlist 로드 (금칙어 판단 참조용)
  const allowlistExists = fs.existsSync(ALLOWLIST_PATH);
  if (allowlistExists) {
    const allowlist = fs.readFileSync(ALLOWLIST_PATH, "utf-8").split("\n").filter(Boolean);
    console.log(`도메인 allowlist: ${allowlist.length}개 단어`);
  }

  // 4. 6단계 검증
  const { valid, report } = validate(merged);

  // 5. 리포트 출력
  console.log(`\n[검증 결과]`);
  console.log(`  전체: ${report.total}개`);
  console.log(`  통과: ${report.passed}개`);
  console.log(`  제거: ${report.removed}개`);
  if (report.errors.length > 0) {
    console.log(`\n[오류] ${report.errors.length}건`);
    report.errors.forEach((e) => console.log(`  ✗ ${e}`));
  }
  if (report.warnings.length > 0) {
    console.log(`\n[경고] ${report.warnings.length}건`);
    report.warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  }

  // 6. 검증된 사전 저장
  fs.writeFileSync(DICT_PATH, JSON.stringify(valid, null, 2) + "\n", "utf-8");
  console.log(`\n✅ ${DICT_PATH} 저장 완료 (${valid.length}개 엔트리)`);
  console.log(`   3,000개 목표 달성률: ${((valid.length / 3000) * 100).toFixed(1)}%`);
  console.log("   → ETL 소스 추가는 loadEtlSource() 를 구현하세요.");
}

main().catch((err) => {
  console.error("ETL 실패:", err);
  process.exit(1);
});
