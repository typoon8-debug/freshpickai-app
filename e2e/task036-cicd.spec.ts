/**
 * Task 036: CI/CD 파이프라인 + Vercel 배포 최적화 E2E
 *
 * TC01 - GitHub Actions CI 워크플로우 파일 존재 확인
 * TC02 - GitHub Actions Migration 워크플로우 파일 존재 확인
 * TC03 - .env.example 필수 환경 변수 문서화 확인
 * TC04 - vercel.json 구조 및 헤더 설정 확인
 * TC05 - AI 라우트 maxDuration 설정 확인
 * TC06 - 헬스체크 API 엔드포인트 응답 확인
 * TC07 - 헬스체크 API JSON 구조 검증
 * TC08 - 헬스체크 API 응답 시간 500ms 이하
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const ROOT = process.cwd();

test.describe("Task036: CI/CD 파이프라인 + Vercel 배포 최적화", () => {
  // ─── TC01: GitHub Actions CI 워크플로우 확인 ──────────────────────────────
  test("TC01 - .github/workflows/ci.yml 존재 및 필수 스텝 포함 확인", () => {
    const ciPath = path.join(ROOT, ".github/workflows/ci.yml");
    expect(fs.existsSync(ciPath)).toBe(true);

    const content = fs.readFileSync(ciPath, "utf-8");

    // 트리거 조건
    expect(content).toContain("pull_request");
    expect(content).toContain("push");

    // 필수 스텝
    expect(content).toContain("npm ci");
    expect(content).toContain("npm run typecheck");
    expect(content).toContain("npm run lint");
    expect(content).toContain("npm run format:check");
    expect(content).toContain("npm run build");
    expect(content).toContain("npm run test:e2e");

    // Playwright 브라우저 설치
    expect(content).toContain("playwright install");

    // 아티팩트 업로드
    expect(content).toContain("playwright-report");

    console.log("✅ TC01 ci.yml 파일 확인 완료");
  });

  // ─── TC02: Migration 워크플로우 확인 ─────────────────────────────────────
  test("TC02 - .github/workflows/migration.yml 존재 및 supabase db push 포함 확인", () => {
    const migPath = path.join(ROOT, ".github/workflows/migration.yml");
    expect(fs.existsSync(migPath)).toBe(true);

    const content = fs.readFileSync(migPath, "utf-8");

    // main 브랜치 머지 시 실행
    expect(content).toContain("branches: [main]");

    // Supabase CLI 설치
    expect(content).toContain("supabase/setup-cli");

    // 마이그레이션 명령어
    expect(content).toContain("supabase db push");
    expect(content).toContain("SUPABASE_ACCESS_TOKEN");

    console.log("✅ TC02 migration.yml 파일 확인 완료");
  });

  // ─── TC03: .env.example 환경 변수 문서화 확인 ────────────────────────────
  test("TC03 - .env.example 필수 환경 변수 모두 문서화 확인", () => {
    const envPath = path.join(ROOT, ".env.example");
    expect(fs.existsSync(envPath)).toBe(true);

    const content = fs.readFileSync(envPath, "utf-8");

    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_ACCESS_TOKEN",
      "ANTHROPIC_API_KEY",
      "OPENAI_API_KEY",
      "RAG_VECTOR_THRESHOLD",
      "RAG_CACHE_THRESHOLD",
      "NEXT_PUBLIC_TOSS_CLIENT_KEY",
      "TOSS_SECRET_KEY",
      "KAKAO_REST_KEY",
      "NEXT_PUBLIC_SENTRY_DSN",
      "NEXT_PUBLIC_POSTHOG_KEY",
    ];

    for (const varName of requiredVars) {
      expect(content).toContain(varName);
    }

    console.log("✅ TC03 .env.example 환경 변수 문서화 확인 완료");
  });

  // ─── TC04: vercel.json 구조 확인 ─────────────────────────────────────────
  test("TC04 - vercel.json 존재 및 헤더·빌드 설정 확인", () => {
    const vercelPath = path.join(ROOT, "vercel.json");
    expect(fs.existsSync(vercelPath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(vercelPath, "utf-8")) as {
      framework: string;
      buildCommand: string;
      headers: { source: string; headers: { key: string; value: string }[] }[];
    };

    // 기본 설정
    expect(config.framework).toBe("nextjs");
    expect(config.buildCommand).toBeTruthy();

    // Cache-Control 헤더
    expect(config.headers?.length).toBeGreaterThanOrEqual(1);
    const staticHeader = config.headers.find(
      (h) => h.source.includes("js") || h.source.includes("css")
    );
    expect(staticHeader).toBeTruthy();

    const cacheHeader = staticHeader?.headers.find((h) => h.key === "Cache-Control");
    expect(cacheHeader?.value).toContain("max-age");

    console.log("✅ TC04 vercel.json 설정 확인 완료");
  });

  // ─── TC05: AI 라우트 maxDuration 설정 확인 ───────────────────────────────
  test("TC05 - AI Route Handler maxDuration 설정 확인", () => {
    const aiRoutes = [
      "src/app/api/ai/chat/route.ts",
      "src/app/api/ai/recommend/route.ts",
      "src/app/api/ai/agent/route.ts",
      "src/app/api/ai/search/route.ts",
    ];

    for (const routePath of aiRoutes) {
      const fullPath = path.join(ROOT, routePath);
      expect(fs.existsSync(fullPath)).toBe(true);

      const content = fs.readFileSync(fullPath, "utf-8");
      expect(content).toContain("maxDuration");
      console.log(`  ${routePath}: maxDuration 설정 ✓`);
    }

    console.log("✅ TC05 AI 라우트 maxDuration 설정 확인 완료");
  });

  // ─── TC06: 헬스체크 API 200 응답 확인 ────────────────────────────────────
  test("TC06 - /api/health 엔드포인트 200 응답 확인", async ({ page }) => {
    const res = await page.goto("/api/health");
    // 앱이 살아있으면 항상 200 (DB 상태는 body.status: "degraded"로 표현)
    expect(res?.status()).toBe(200);

    console.log("✅ TC06 헬스체크 API 200 응답 확인 완료");
  });

  // ─── TC07: 헬스체크 API JSON 구조 검증 ───────────────────────────────────
  test("TC07 - /api/health JSON 구조 검증 (status·timestamp·checks)", async ({ page }) => {
    const res = await page.goto("/api/health");
    expect(res?.status()).toBe(200);

    const body = (await res?.json()) as {
      status: string;
      timestamp: string;
      checks: Record<string, boolean>;
    };

    expect(body.status).toMatch(/^(ok|degraded)$/);
    expect(body.timestamp).toBeTruthy();
    expect(new Date(body.timestamp).toString()).not.toBe("Invalid Date");
    expect(body.checks).toBeTruthy();
    expect(typeof body.checks.app).toBe("boolean");

    console.log(`✅ TC07 헬스체크 JSON 구조 검증 완료 — status: ${body.status}`);
  });

  // ─── TC08: 헬스체크 API 응답 속도 검증 ───────────────────────────────────
  test("TC08 - /api/health 응답 시간 1000ms 이하 검증", async ({ page }) => {
    const start = Date.now();
    const res = await page.goto("/api/health");
    const elapsed = Date.now() - start;

    expect(res?.status()).toBe(200);
    // DB 쿼리 포함으로 네트워크 왕복 시간 허용
    expect(elapsed).toBeLessThan(1000);

    console.log(`✅ TC08 헬스체크 응답 속도 검증 완료 — ${elapsed}ms`);
  });
});
