/**
 * Task 065 + 066: AI 채팅 3계층 메모리 + 인텐트 버튼 E2E
 *
 * [Task 065 — F032: 3계층 맥락 메모리]
 * TC01 - 메모리 조회 유틸 파일 존재 + 3계층 조회 함수 구조 확인
 * TC02 - 메모리 저장 유틸 파일 존재 + saveRawMessage 구조 확인
 * TC03 - pgvector RPC 마이그레이션 파일 존재
 * TC04 - chat/route.ts: 메모리 통합 (import + sessionId + formatMemoryContext)
 * TC05 - cleanup-chat-memory cron route 존재
 * TC06 - MemoryDebugPanel 컴포넌트 존재 + dev-only 가드
 * TC07 - useChatStream: sessionId 포함 전송 + updateIntents 연결
 * TC08 - useChatStore: updateIntents 액션 추가 확인
 * TC09 - vercel.json cron 등록 확인
 *
 * [Task 066 — F033: 인텐트 버튼 피드백 채널]
 * TC10 - ActionButtonRenderer 컴포넌트 존재 + 9종 enum 매핑
 * TC11 - suggestIntents AI 도구 파일 존재
 * TC12 - chat/route.ts: suggestIntents 도구 추가 + 인텐트 규칙 프롬프트
 * TC13 - message.tsx: ActionButtonRenderer 렌더링 통합
 * TC14 - ChatPage: handleActionSelect 정의 + enum 분기 처리
 * TC15 - schema.ts: ChatResponseSchema + ChatActionIntentSchema 존재
 * TC16 - ChatMessage 타입에 intents 필드 추가 확인
 * TC17 - 채팅 페이지 로드 + 핵심 UI 요소 렌더링 (브라우저)
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { login } from "./helpers/auth";

const ROOT = process.cwd();

// ═══════════════════════════════════════════════════════════════════════
// Task 065: AI 채팅 3계층 맥락 메모리 (F032)
// ═══════════════════════════════════════════════════════════════════════

test.describe("Task065: AI 채팅 3계층 맥락 메모리 (F032)", () => {
  test("TC01 - 메모리 조회 유틸 파일 + 3계층 병렬 조회 구조 확인", () => {
    const retrievePath = path.join(ROOT, "src/lib/chat/memory/retrieve.ts");
    expect(fs.existsSync(retrievePath), "retrieve.ts 파일 존재").toBe(true);

    const content = fs.readFileSync(retrievePath, "utf-8");

    // Layer 1: fp_chat_message_raw
    expect(content).toContain("fp_chat_message_raw");
    // Layer 2: fp_chat_session_summary
    expect(content).toContain("fp_chat_session_summary");
    // Layer 3: pgvector RPC
    expect(content).toContain("fp_search_memory_items");
    // 병렬 실행
    expect(content).toContain("Promise.all");
    // 반환 타입
    expect(content).toContain("ChatMemoryContext");
    // 포맷 함수
    expect(content).toContain("formatMemoryContext");
  });

  test("TC02 - 메모리 저장 유틸 파일 + saveRawMessage 구조 확인", () => {
    const storePath = path.join(ROOT, "src/lib/chat/memory/store.ts");
    expect(fs.existsSync(storePath), "store.ts 파일 존재").toBe(true);

    const content = fs.readFileSync(storePath, "utf-8");

    // 원문 저장
    expect(content).toContain("saveRawMessage");
    expect(content).toContain("fp_chat_message_raw");
    // 세션 요약 (Haiku 활용)
    expect(content).toContain("saveSessionSummary");
    expect(content).toContain("fp_chat_session_summary");
    // 장기 기억 (임베딩 + 중복 체크)
    expect(content).toContain("upsertMemoryItems");
    expect(content).toContain("fp_memory_items");
    expect(content).toContain("importance");
  });

  test("TC03 - pgvector RPC 마이그레이션 파일 존재", () => {
    const migrationsDir = path.join(ROOT, "supabase/migrations");
    const files = fs.readdirSync(migrationsDir);
    const rpcFile = files.find((f) => f.includes("memory_search_rpc"));
    expect(rpcFile, "fp_search_memory_items RPC 마이그레이션 파일").toBeTruthy();

    if (rpcFile) {
      const content = fs.readFileSync(path.join(migrationsDir, rpcFile), "utf-8");
      expect(content).toContain("fp_search_memory_items");
      // pgvector 코사인 거리 연산자 사용
      expect(content).toContain("<=>");
      expect(content).toContain("SECURITY DEFINER");
    }
  });

  test("TC04 - chat/route.ts: 메모리 통합 확인", () => {
    const routePath = path.join(ROOT, "src/app/api/ai/chat/route.ts");
    expect(fs.existsSync(routePath), "chat route 파일 존재").toBe(true);

    const content = fs.readFileSync(routePath, "utf-8");

    // 메모리 import
    expect(content).toContain("retrieveMemoryContext");
    expect(content).toContain("formatMemoryContext");
    expect(content).toContain("saveRawMessage");
    // sessionId 처리
    expect(content).toContain("sessionId");
    // 메모리 컨텍스트 삽입
    expect(content).toContain("사용자 기억");
    // 병렬 실행
    expect(content).toContain("Promise.all");
  });

  test("TC05 - cleanup-chat-memory cron route 존재", () => {
    const cronPath = path.join(ROOT, "src/app/api/cron/cleanup-chat-memory/route.ts");
    expect(fs.existsSync(cronPath), "cron route 파일 존재").toBe(true);

    const content = fs.readFileSync(cronPath, "utf-8");
    expect(content).toContain("fp_chat_message_raw");
    expect(content).toContain("CRON_SECRET");
    // 30일 TTL 계산 방식 확인 (문자열 또는 숫자 방식 모두 허용)
    expect(content).toMatch(/30\s*[\*×]\s*24|30 days|INTERVAL '30/i);
  });

  test("TC06 - MemoryDebugPanel: dev-only 가드 확인", () => {
    const panelPath = path.join(ROOT, "src/components/chat/MemoryDebugPanel.tsx");
    expect(fs.existsSync(panelPath), "MemoryDebugPanel 파일 존재").toBe(true);

    const content = fs.readFileSync(panelPath, "utf-8");
    // 개발 모드 가드
    expect(content).toContain("NODE_ENV");
    expect(content).toContain("development");
    // 3계층 표시
    expect(content).toContain("recentMessages");
    expect(content).toContain("sessionSummaries");
    expect(content).toContain("memoryItems");
  });

  test("TC07 - useChatStream: sessionId 전송 + updateIntents 연결 확인", () => {
    const hookPath = path.join(ROOT, "src/hooks/use-chat-stream.ts");
    const content = fs.readFileSync(hookPath, "utf-8");

    // sessionId 포함 전송
    expect(content).toContain("sessionId");
    expect(content).toContain("getSessionId");
    // updateIntents 연결
    expect(content).toContain("updateIntents");
    expect(content).toContain("pendingIntents");
    // suggestIntents tool-output 파싱
    expect(content).toContain("intents");
  });

  test("TC08 - useChatStore: updateIntents 액션 확인", () => {
    const storePath = path.join(ROOT, "src/lib/store.ts");
    const content = fs.readFileSync(storePath, "utf-8");

    expect(content).toContain("updateIntents");
    expect(content).toContain("ChatActionIntent");
  });

  test("TC09 - vercel.json: cleanup-chat-memory cron 등록 확인", () => {
    const vercelPath = path.join(ROOT, "vercel.json");
    const content = fs.readFileSync(vercelPath, "utf-8");
    const vercelConfig = JSON.parse(content) as {
      crons: Array<{ path: string; schedule: string }>;
    };

    const cleanupCron = vercelConfig.crons.find((c) => c.path.includes("cleanup-chat-memory"));
    expect(cleanupCron, "cleanup-chat-memory cron 항목").toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Task 066: 인텐트 기반 버튼 피드백 채널 (F033)
// ═══════════════════════════════════════════════════════════════════════

test.describe("Task066: 인텐트 기반 버튼 피드백 채널 (F033)", () => {
  test("TC10 - ActionButtonRenderer: 9종 enum 매핑 확인", () => {
    const rendererPath = path.join(ROOT, "src/components/chat/ActionButtonRenderer.tsx");
    expect(fs.existsSync(rendererPath), "ActionButtonRenderer 파일 존재").toBe(true);

    const content = fs.readFileSync(rendererPath, "utf-8");

    // 9종 ChatActionEnum 처리
    expect(content).toContain("ADD_TO_CART");
    expect(content).toContain("ADD_TO_WISHLIST");
    expect(content).toContain("INITIATE_PAYMENT");
    expect(content).toContain("VIEW_CARD");
    expect(content).toContain("CONFIRM_YES");
    expect(content).toContain("CONFIRM_NO");
    expect(content).toContain("SEARCH_MORE");
    expect(content).toContain("UPDATE_CART");
    expect(content).toContain("REMOVE_FROM_CART");
    // 44px 모바일 터치 타겟
    expect(content).toContain("44px");
    // 접근성
    expect(content).toContain("aria-label");
  });

  test("TC11 - suggestIntents AI 도구 파일 존재 + 구조 확인", () => {
    const toolPath = path.join(ROOT, "src/lib/ai/tools/suggest-intents.ts");
    expect(fs.existsSync(toolPath), "suggest-intents.ts 파일 존재").toBe(true);

    const content = fs.readFileSync(toolPath, "utf-8");

    // tool() 사용
    expect(content).toContain("tool(");
    // intents 파라미터 + execute
    expect(content).toContain("intents");
    expect(content).toContain("execute");
    expect(content).toContain("success: true");
    // ChatActionEnum 기반
    expect(content).toContain("ChatActionEnum");
  });

  test("TC12 - chat/route.ts: suggestIntents 도구 + 인텐트 규칙 추가", () => {
    const routePath = path.join(ROOT, "src/app/api/ai/chat/route.ts");
    const content = fs.readFileSync(routePath, "utf-8");

    // suggestIntents 도구 등록
    expect(content).toContain("suggestIntents");
    expect(content).toContain("createSuggestIntentsTool");
    // 인텐트 생성 규칙 시스템 프롬프트
    expect(content).toContain("INTENTS_RULE");
    expect(content).toContain("ADD_TO_CART");
  });

  test("TC13 - message.tsx: ActionButtonRenderer 통합 확인", () => {
    const msgPath = path.join(ROOT, "src/components/chat/message.tsx");
    const content = fs.readFileSync(msgPath, "utf-8");

    expect(content).toContain("ActionButtonRenderer");
    expect(content).toContain("intents");
    expect(content).toContain("onActionSelect");
  });

  test("TC14 - ChatPage: handleActionSelect + enum 분기 처리 확인", () => {
    const pagePath = path.join(ROOT, "src/app/(main)/chat/page.tsx");
    const content = fs.readFileSync(pagePath, "utf-8");

    expect(content).toContain("handleActionSelect");
    expect(content).toContain("VIEW_CARD");
    expect(content).toContain("ADD_TO_CART");
    expect(content).toContain("INITIATE_PAYMENT");
    expect(content).toContain("CONFIRM_YES");
    expect(content).toContain("onActionSelect");
  });

  test("TC15 - schema.ts: ChatResponseSchema + ChatActionIntentSchema 확인", () => {
    const schemaPath = path.join(ROOT, "src/lib/chat/schema.ts");
    expect(fs.existsSync(schemaPath), "schema.ts 파일 존재").toBe(true);

    const content = fs.readFileSync(schemaPath, "utf-8");
    expect(content).toContain("ChatResponseSchema");
    expect(content).toContain("ChatActionIntentSchema");
    expect(content).toContain("intents");
    expect(content).toContain("message");
  });

  test("TC16 - ChatMessage 타입에 intents 필드 추가 확인", () => {
    const typesPath = path.join(ROOT, "src/lib/types.ts");
    const content = fs.readFileSync(typesPath, "utf-8");

    // ChatMessage 타입에 intents 필드
    const chatMsgMatch = content.match(/export type ChatMessage = \{[\s\S]*?\};/);
    expect(chatMsgMatch, "ChatMessage 타입 블록").toBeTruthy();
    if (chatMsgMatch) {
      expect(chatMsgMatch[0]).toContain("intents");
      expect(chatMsgMatch[0]).toContain("ChatActionIntent");
    }
  });

  test("TC17 - 채팅 페이지 로드 + 핵심 UI 요소 (브라우저)", async ({ page }) => {
    await login(page);
    await page.goto("/chat");
    await page.waitForLoadState("domcontentloaded");

    // AI 채팅 페이지 로드
    await expect(page).toHaveURL(/\/chat/);

    // 핵심 UI 요소 존재
    await expect(page.getByRole("button", { name: "냉장고 비우기 모드" })).toBeVisible({
      timeout: 10000,
    });

    // 채팅 입력창 존재
    const chatInput = page.getByRole("textbox").or(page.locator("textarea")).first();
    await expect(chatInput).toBeVisible({ timeout: 5000 });
  });
});
