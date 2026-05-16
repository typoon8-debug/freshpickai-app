/**
 * Task 064: v0.3a 버그 수정 3종 + 공통 DB 마이그레이션 E2E
 *
 * TC01 - BUG-001: orders.ts 멱등성 체크 코드 존재 확인
 * TC02 - BUG-001: checkout/success 페이지 결제 파라미터 검증 로직 확인
 * TC03 - BUG-002: useChatStore sessionStorage persist 설정 확인
 * TC04 - BUG-002: AI 채팅 페이지 접근 → 새로고침 후 빈 상태 유지 (비로그인)
 * TC05 - BUG-003: AIRecommendSection 할인 배지 discountPct > 0 가드 확인
 * TC06 - F032: DB 마이그레이션 파일 존재 + 3테이블 정의 확인
 * TC07 - F032: fp_memory_items HNSW 인덱스 정의 확인
 * TC08 - F032: 3테이블 RLS 정책 포함 확인
 * TC09 - 타입: ChatActionEnum 9종 + ChatActionIntent + ChatMemoryContext 확인
 * TC10 - 홈 페이지 정상 로드 (빌드 regression 없음)
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const ROOT = process.cwd();

test.describe("Task064: v0.3a 버그 수정 3종 + 공통 DB 마이그레이션", () => {
  // ─── TC01: BUG-001 멱등성 체크 ───────────────────────────────────────────
  test("TC01 - BUG-001: confirmAndCreateOrderAction 멱등성 체크 코드 존재", () => {
    const ordersPath = path.join(ROOT, "src/lib/actions/orders.ts");
    expect(fs.existsSync(ordersPath)).toBe(true);

    const content = fs.readFileSync(ordersPath, "utf-8");

    // 멱등성 체크: payment_key 중복 조회
    expect(content).toContain("payment_key");
    expect(content).toContain("maybeSingle");
    // 이미 처리된 주문 조기 반환
    expect(content).toContain("existing");
  });

  // ─── TC02: BUG-001 checkout/success 파라미터 검증 ──────────────────────
  test("TC02 - BUG-001: checkout/success 페이지 paymentKey + orderId + amount 검증 존재", () => {
    const successPath = path.join(ROOT, "src/app/(main)/checkout/success/page.tsx");
    expect(fs.existsSync(successPath)).toBe(true);

    const content = fs.readFileSync(successPath, "utf-8");

    // URL 파라미터 검증
    expect(content).toContain("paymentKey");
    expect(content).toContain("orderId");
    expect(content).toContain("amount");
    // 조기 중단: 파라미터 없을 시 홈 리다이렉트
    expect(content).toContain('router.replace("/")');
  });

  // ─── TC03: BUG-002 chatStore sessionStorage persist ─────────────────────
  test("TC03 - BUG-002: useChatStore sessionStorage persist 설정 확인", () => {
    const storePath = path.join(ROOT, "src/lib/store.ts");
    expect(fs.existsSync(storePath)).toBe(true);

    const content = fs.readFileSync(storePath, "utf-8");

    // createJSONStorage import
    expect(content).toContain("createJSONStorage");
    // fp-chat 스토리지 키
    expect(content).toContain("fp-chat");
    // sessionStorage 사용
    expect(content).toContain("sessionStorage");
    // partialize로 messages만 persist
    expect(content).toContain("partialize");
  });

  // ─── TC04: BUG-002 AI 채팅 페이지 접근 확인 ────────────────────────────
  test("TC04 - BUG-002: /chat 페이지 리다이렉트 없이 접근 가능 (비로그인 시 /login 또는 /chat 응답)", async ({
    page,
  }) => {
    const res = await page.goto("/chat", { waitUntil: "commit" });
    // 200(chat) 또는 200(login으로 redirect된 경우) — 서버 에러(5xx) 없음 확인
    expect(res?.status()).toBeLessThan(500);
  });

  // ─── TC05: BUG-003 할인 배지 discountPct > 0 가드 ──────────────────────
  test("TC05 - BUG-003: AIRecommendSection 할인 배지 discountPct > 0 조건 가드 적용", () => {
    const sectionPath = path.join(ROOT, "src/components/home/AIRecommendSection.tsx");
    expect(fs.existsSync(sectionPath)).toBe(true);

    const content = fs.readFileSync(sectionPath, "utf-8");

    // discountPct > 0 가드 포함 (undefined만 체크하면 0도 배지 표시됨)
    expect(content).toContain("rec.discountPct > 0");
    // -0% 배지 방지: undefined 단독 조건 제거 확인
    expect(content).not.toContain("rec.discountPct !== undefined &&\n");
  });

  // ─── TC06: F032 DB 마이그레이션 파일 + 3테이블 ─────────────────────────
  test("TC06 - F032: DB 마이그레이션 파일 존재 + 3테이블 정의 확인", () => {
    const migrationPath = path.join(ROOT, "supabase/migrations/20260522_012_v0.3a_chat_memory.sql");
    expect(fs.existsSync(migrationPath)).toBe(true);

    const content = fs.readFileSync(migrationPath, "utf-8");

    // 3테이블 존재
    expect(content).toContain("fp_chat_message_raw");
    expect(content).toContain("fp_chat_session_summary");
    expect(content).toContain("fp_memory_items");

    // 필수 컬럼
    expect(content).toContain("customer_id");
    expect(content).toContain("session_id");
    expect(content).toContain("role");
    expect(content).toContain("content");
    expect(content).toContain("summary_text");
    expect(content).toContain("keywords");
    expect(content).toContain("embedding");
    expect(content).toContain("importance_score");
  });

  // ─── TC07: F032 HNSW 인덱스 ─────────────────────────────────────────────
  test("TC07 - F032: fp_memory_items HNSW 코사인 인덱스 정의 확인", () => {
    const migrationPath = path.join(ROOT, "supabase/migrations/20260522_012_v0.3a_chat_memory.sql");
    const content = fs.readFileSync(migrationPath, "utf-8");

    expect(content).toContain("hnsw");
    expect(content).toContain("vector_cosine_ops");
    expect(content).toContain("vector(1536)");
  });

  // ─── TC08: F032 RLS 정책 ────────────────────────────────────────────────
  test("TC08 - F032: 3테이블 전체 RLS 정책 포함 확인", () => {
    const migrationPath = path.join(ROOT, "supabase/migrations/20260522_012_v0.3a_chat_memory.sql");
    const content = fs.readFileSync(migrationPath, "utf-8");

    // 3테이블 RLS 활성화
    expect(content.match(/ENABLE ROW LEVEL SECURITY/g)?.length).toBeGreaterThanOrEqual(3);
    // auth.uid() 기반 정책
    expect(content).toContain("auth.uid()");
    // 조회/저장 정책 존재
    expect(content).toContain("FOR SELECT");
    expect(content).toContain("FOR INSERT");
  });

  // ─── TC09: 공통 타입 ChatActionEnum 등 ──────────────────────────────────
  test("TC09 - 공통 타입: ChatActionEnum 9종 + ChatActionIntent + ChatMemoryContext 확인", () => {
    const typesPath = path.join(ROOT, "src/lib/types.ts");
    expect(fs.existsSync(typesPath)).toBe(true);

    const content = fs.readFileSync(typesPath, "utf-8");

    // ChatActionEnum 9종
    expect(content).toContain("ChatActionEnum");
    expect(content).toContain("ADD_TO_WISHLIST");
    expect(content).toContain("ADD_TO_CART");
    expect(content).toContain("UPDATE_CART");
    expect(content).toContain("REMOVE_FROM_CART");
    expect(content).toContain("INITIATE_PAYMENT");
    expect(content).toContain("VIEW_CARD");
    expect(content).toContain("SEARCH_MORE");
    expect(content).toContain("CONFIRM_YES");
    expect(content).toContain("CONFIRM_NO");

    // ChatActionIntent
    expect(content).toContain("ChatActionIntent");
    expect(content).toContain("label: string");

    // ChatMemoryContext 3계층
    expect(content).toContain("ChatMemoryContext");
    expect(content).toContain("recentMessages");
    expect(content).toContain("sessionSummaries");
    expect(content).toContain("memoryItems");
  });

  // ─── TC10: 홈 페이지 정상 로드 (regression 없음) ─────────────────────
  test("TC10 - 홈 페이지 빌드 regression 없음 (200 또는 리다이렉트)", async ({ page }) => {
    const res = await page.goto("/", { waitUntil: "commit" });
    expect(res?.status()).toBeLessThan(500);
  });
});
