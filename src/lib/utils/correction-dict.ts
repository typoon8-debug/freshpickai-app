import type { DictEntry } from "./correction-dict.types";
import rawDict from "@/data/correction-dict/dict.json";

const entries: DictEntry[] = rawDict as DictEntry[];

/** 긴 키 우선 greedy replace로 오타 보정 */
export function applyCorrection(text: string): string {
  const sorted = [...entries].sort((a, b) => b.wrong.length - a.wrong.length);
  return sorted.reduce((t, e) => t.replaceAll(e.wrong, e.correct), text);
}

/** 사전 엔트리 전체 조회 (ETL·관리용) */
export function getDictEntries(): readonly DictEntry[] {
  return entries;
}
