import { applyCorrection } from "./memo-correction-dict";

export interface ParsedMemoItem {
  item: string;
  raw_token: string;
  qty_value: number | null;
  qty_unit: string | null;
}

export interface ParseResult {
  items: ParsedMemoItem[];
  note: string | null;
}

// 지원하는 수량 단위 (긴 것 우선)
const UNITS =
  "봉지|인분|묶음|박스|세트|리터|그램|킬로|판|팩|개|병|캔|통|줄|근|마리|장|권|kg|ml|g|L|l";

const NOTE_RE = new RegExp(
  `^(.*\\d+(?:\\.\\d+)?(?:${UNITS}))\\s+([가-힣a-zA-Z]+(?:\\s+[가-힣a-zA-Z]+)*)$`
);

const TOKEN_RE = new RegExp(`^([가-힣a-zA-Z][가-힣a-zA-Z\\s]*?)(\\d+(?:\\.\\d+)?)(${UNITS})?\\s*$`);

/**
 * "단위 → 한글" 경계에 NULL 구분자를 삽입해 토큰 분리.
 * 단위와 다음 한글 사이 공백 0~N개 모두 처리 ("2판새우깡" / "2판 새우깡" 모두 분리).
 */
function splitAtUnitBoundary(text: string): string[] {
  // \s* 로 단위 뒤 공백 포함 처리
  const marked = text.replace(new RegExp(`(${UNITS})\\s*([가-힣a-zA-Z])`, "g"), "$1\x00$2");
  return marked.split("\x00").filter((t) => t.trim().length > 0);
}

function parseToken(tok: string): ParsedMemoItem {
  const trimmed = tok.trim();
  const m = trimmed.match(TOKEN_RE);
  if (m) {
    return {
      item: m[1].trim(),
      raw_token: trimmed,
      qty_value: parseFloat(m[2]),
      qty_unit: m[3] ?? null,
    };
  }
  return { item: trimmed, raw_token: trimmed, qty_value: null, qty_unit: null };
}

/** raw_text에서 품목 배열과 공유 노트를 분리 (4-step 파이프라인) */
export function parseMemoItemText(rawText: string): ParseResult {
  const text = rawText.trim();
  if (!text) {
    return { items: [{ item: "", raw_token: "", qty_value: null, qty_unit: null }], note: null };
  }

  // STEP 1 — 노트 추출
  let body = text;
  let note: string | null = null;

  const noteMatch = text.match(NOTE_RE);
  if (noteMatch) {
    body = noteMatch[1].trim();
    note = noteMatch[2].trim();
  } else {
    const spaceTokens = text.split(/\s+/);
    if (spaceTokens.length >= 3) {
      const last = spaceTokens[spaceTokens.length - 1];
      // 노트 후보: 순수 한글/알파벳, 숫자 없음
      if (/^[가-힣a-zA-Z]+$/.test(last)) {
        note = last;
        body = spaceTokens.slice(0, -1).join(" ");
      }
    }
  }

  // STEP 2 — 구분자 분할
  let tokens: string[] = body
    .split(/[,:/·]/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 1) {
    tokens = splitAtUnitBoundary(tokens[0])
      .map((t) => t.trim())
      .filter(Boolean);
    if (tokens.length === 0) tokens = [body];
  }

  // STEP 3+4 — 토큰별 파싱 + 퍼지 보정
  const items: ParsedMemoItem[] = tokens
    .map((tok) => {
      const parsed = parseToken(tok);
      const corrected = applyCorrection(parsed.item)
        .replace(/[!~?*]/g, "")
        .trim();
      return { ...parsed, item: corrected };
    })
    .filter((p) => p.item.length > 0);

  if (items.length === 0) {
    return {
      items: [
        {
          item: text.replace(/[!~?*]/g, "").trim() || text,
          raw_token: text,
          qty_value: null,
          qty_unit: null,
        },
      ],
      note: null,
    };
  }

  return { items, note };
}
