import { describe, expect, it } from "vitest";

import { applyCorrection, getDictEntries } from "./correction-dict";

describe("applyCorrection", () => {
  it("계란 2판 — 이미 정상 단어는 변경 없음", () => {
    expect(applyCorrection("계란 2판")).toBe("계란 2판");
  });

  it("달걀 → 계란 표준어 교정", () => {
    expect(applyCorrection("달걀 2판")).toBe("계란 2판");
  });

  it("게란 → 계란 오타 보정", () => {
    expect(applyCorrection("게란")).toBe("계란");
  });

  it("삽겹살 → 삼겹살", () => {
    expect(applyCorrection("삽겹살 500g")).toBe("삼겹살 500g");
  });

  it("떡뽁이 → 떡볶이", () => {
    expect(applyCorrection("떡뽁이")).toBe("떡볶이");
  });

  it("김치찌게 → 김치찌개", () => {
    expect(applyCorrection("김치찌게 한 봉지")).toBe("김치찌개 한 봉지");
  });

  it("랍스타 → 랍스터 외래어 표기 보정", () => {
    expect(applyCorrection("랍스타")).toBe("랍스터");
  });

  it("케잌 → 케이크", () => {
    expect(applyCorrection("생크림케잌")).toBe("생크림케이크");
  });

  it("긴 키 우선 — 순두부찌게가 찌게보다 먼저 매칭", () => {
    expect(applyCorrection("순두부찌게")).toBe("순두부찌개");
  });

  it("복합 오타 — 한 문장에 여러 오타 동시 보정", () => {
    expect(applyCorrection("게란 2판이랑 삽겹살 500g")).toBe("계란 2판이랑 삼겹살 500g");
  });

  it("사전에 없는 단어 — 원본 그대로 반환", () => {
    expect(applyCorrection("블루베리 한 팩")).toBe("블루베리 한 팩");
  });

  it("빈 문자열 입력", () => {
    expect(applyCorrection("")).toBe("");
  });

  it("재귀 안정성 — greedy reduce 1회 순회, 무한 루프 없음", () => {
    // 달걀→계란, 게란→계란 둘 다 있어도 정답(계란)이 또 변환되지 않음
    expect(applyCorrection("달걀 게란 삽겹살")).toBe("계란 계란 삼겹살");
  });

  it("재귀 안정성 — 보정 결과가 다른 wrong 엔트리와 겹쳐도 추가 보정 없음", () => {
    // applyCorrection 는 sorted entries 를 한 번만 reduce 하므로 재귀 없음
    const result = applyCorrection("달걀");
    // 계란 자체가 wrong 으로 등록된 엔트리가 없으므로 결과는 계란
    expect(result).toBe("계란");
  });
});

describe("getDictEntries", () => {
  it("사전 엔트리가 비어있지 않음", () => {
    expect(getDictEntries().length).toBeGreaterThan(0);
  });

  it("모든 엔트리가 DictEntry 형식 준수", () => {
    for (const e of getDictEntries()) {
      expect(typeof e.wrong).toBe("string");
      expect(typeof e.correct).toBe("string");
      expect(["manual", "etl", "user_feedback"]).toContain(e.source);
    }
  });

  it("wrong 필드가 빈 문자열인 엔트리 없음", () => {
    const blanks = getDictEntries().filter((e) => e.wrong.trim() === "");
    expect(blanks).toHaveLength(0);
  });

  it("correct 필드가 빈 문자열인 엔트리 없음", () => {
    const blanks = getDictEntries().filter((e) => e.correct.trim() === "");
    expect(blanks).toHaveLength(0);
  });
});
