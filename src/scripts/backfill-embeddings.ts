/**
 * 임베딩 백필 스크립트
 * 실행: npx tsx src/scripts/backfill-embeddings.ts
 *
 * 대상:
 *  1. fp_dish           — embedding IS NULL 레코드
 *  2. fp_dish_recipe    — embedding IS NULL + status='approved' 레코드
 *  3. fp_store_item_embedding — v_store_inventory_item(ai_status='ACTIVE') 미등록 상품
 *
 * Supabase PostgREST 기본 응답 상한(1000행/요청)을 range() 페이지네이션으로 우회.
 * 스크립트 중단 후 재실행 시 기존 임베딩된 항목을 자동 스킵(멱등 설계).
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

config({ path: ".env.local" });
config({ path: ".env" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_KEY = process.env.OPENAI_API_KEY!;

const BATCH_SIZE = 50; // OpenAI 임베딩 요청당 텍스트 수
const PAGE_SIZE = 1000; // Supabase PostgREST 1회 최대 응답 행 수

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_KEY });

async function embedBatch(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts.map((t) => t.slice(0, 8000)),
  });
  return response.data.map((d) => d.embedding);
}

function vecToSql(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── 1. fp_dish 백필 ───────────────────────────────────────────────────────────
async function backfillDishes(): Promise<void> {
  console.log("\n[1/3] fp_dish 임베딩 백필 시작...");

  const { data: dishes, error } = await supabase
    .from("fp_dish")
    .select("dish_id, name, description, diet_tags, persona_tags")
    .is("embedding", null);

  if (error) {
    console.error("  fp_dish 조회 실패:", error.message);
    return;
  }
  if (!dishes || dishes.length === 0) {
    console.log("  백필 필요 없음 (모두 이미 임베딩됨)");
    return;
  }

  console.log(`  대상 ${dishes.length}건`);
  let done = 0;

  for (let i = 0; i < dishes.length; i += BATCH_SIZE) {
    const batch = dishes.slice(i, i + BATCH_SIZE);
    const texts = batch.map((d) =>
      [
        d.name,
        d.description ?? "",
        (d.diet_tags as string[]).join(" "),
        (d.persona_tags as string[]).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
    );

    const embeddings = await embedBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const { error: uErr } = await supabase
        .from("fp_dish")
        .update({ embedding: vecToSql(embeddings[j]) })
        .eq("dish_id", batch[j].dish_id);
      if (uErr) console.error(`  dish ${batch[j].dish_id} 업데이트 실패:`, uErr.message);
    }

    done += batch.length;
    console.log(`  진행: ${done}/${dishes.length}`);
    await sleep(100);
  }
  console.log("  fp_dish 백필 완료");
}

// ── 2. fp_dish_recipe 백필 ────────────────────────────────────────────────────
async function backfillRecipes(): Promise<void> {
  console.log("\n[2/3] fp_dish_recipe 임베딩 백필 시작...");

  const { data: recipes, error } = await supabase
    .from("fp_dish_recipe")
    .select("recipe_id, title, body")
    .is("embedding", null)
    .eq("status", "approved");

  if (error) {
    console.error("  fp_dish_recipe 조회 실패:", error.message);
    return;
  }
  if (!recipes || recipes.length === 0) {
    console.log("  백필 필요 없음");
    return;
  }

  console.log(`  대상 ${recipes.length}건`);
  let done = 0;

  for (let i = 0; i < recipes.length; i += BATCH_SIZE) {
    const batch = recipes.slice(i, i + BATCH_SIZE);
    const texts = batch.map((r) => `${r.title} ${r.body ?? ""}`.slice(0, 8000));
    const embeddings = await embedBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const { error: uErr } = await supabase
        .from("fp_dish_recipe")
        .update({ embedding: vecToSql(embeddings[j]) })
        .eq("recipe_id", batch[j].recipe_id);
      if (uErr) console.error(`  recipe ${batch[j].recipe_id} 업데이트 실패:`, uErr.message);
    }

    done += batch.length;
    console.log(`  진행: ${done}/${recipes.length}`);
    await sleep(100);
  }
  console.log("  fp_dish_recipe 백필 완료");
}

// ── 3. fp_store_item_embedding 백필 ──────────────────────────────────────────

/** fp_store_item_embedding에 저장된 모든 store_item_id를 페이지네이션으로 수집 */
async function fetchAllExistingIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("fp_store_item_embedding")
      .select("store_item_id")
      .order("store_item_id")
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("  기존 임베딩 ID 조회 실패:", error.message);
      break;
    }
    if (!data || data.length === 0) break;

    data.forEach((r: { store_item_id: string }) => ids.add(r.store_item_id));
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return ids;
}

async function backfillStoreItems(): Promise<void> {
  console.log("\n[3/3] fp_store_item_embedding 백필 시작...");

  // Step 1: 이미 임베딩된 ID 전체 수집 (페이지네이션)
  console.log("  기존 임베딩 ID 수집 중...");
  const existingIds = await fetchAllExistingIds();
  console.log(`  기존 임베딩: ${existingIds.size}건`);

  // Step 2: ACTIVE 상품 총 건수 확인
  const { count: totalCount, error: countErr } = await supabase
    .from("v_store_inventory_item")
    .select("store_item_id", { count: "exact", head: true })
    .eq("ai_status", "ACTIVE")
    .not("item_name", "is", null);

  if (countErr) {
    console.error("  전체 건수 조회 실패:", countErr.message);
    return;
  }
  const total = totalCount ?? 0;
  console.log(`  전체 ACTIVE 상품: ${total}건`);

  if (total === 0) {
    console.log("  ACTIVE 상품 없음");
    return;
  }

  // Step 3: 페이지별로 순회하여 미임베딩 항목 처리
  let sessionDone = 0;
  let sessionSkip = 0;

  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    const pageEnd = Math.min(offset + PAGE_SIZE - 1, total - 1);
    const { data: page, error: pageErr } = await supabase
      .from("v_store_inventory_item")
      .select("store_item_id, item_name, ai_ad_copy, ai_tags")
      .eq("ai_status", "ACTIVE")
      .not("item_name", "is", null)
      .order("store_item_id")
      .range(offset, pageEnd);

    if (pageErr) {
      console.error(`  페이지 ${offset + 1}~${pageEnd + 1} 조회 실패:`, pageErr.message);
      continue;
    }
    if (!page || page.length === 0) break;

    type RawItem = {
      store_item_id: string;
      item_name: string | null;
      ai_ad_copy: string | null;
      ai_tags: string[] | null;
    };

    const unembedded = (page as RawItem[]).filter((item) => !existingIds.has(item.store_item_id));
    sessionSkip += page.length - unembedded.length;

    console.log(
      `  페이지 ${offset + 1}~${offset + page.length}:` +
        ` 전체 ${page.length}건 중 신규 ${unembedded.length}건` +
        ` (누적 완료: ${sessionDone}건)`
    );

    // BATCH_SIZE 단위로 OpenAI 임베딩 + upsert
    for (let i = 0; i < unembedded.length; i += BATCH_SIZE) {
      const batch = unembedded.slice(i, i + BATCH_SIZE);
      const texts = batch.map((item) =>
        [item.item_name ?? "", item.ai_ad_copy ?? "", (item.ai_tags ?? []).join(" ")]
          .filter(Boolean)
          .join(" ")
          .slice(0, 8000)
      );

      const embeddings = await embedBatch(texts);

      const rows = batch.map((item, j) => ({
        store_item_id: item.store_item_id,
        item_name: item.item_name,
        embedding: vecToSql(embeddings[j]),
      }));

      const { error: uErr } = await supabase
        .from("fp_store_item_embedding")
        .upsert(rows, { onConflict: "store_item_id" });

      if (uErr) {
        console.error("  upsert 실패:", uErr.message);
      } else {
        batch.forEach((item) => existingIds.add(item.store_item_id));
        sessionDone += batch.length;
      }

      // OpenAI RPM 제한 방어: 배치 간 200ms 대기
      if (i + BATCH_SIZE < unembedded.length) {
        await sleep(200);
      }
    }
  }

  console.log(
    `\n  ✅ fp_store_item_embedding 완료` + ` — 신규 ${sessionDone}건 임베딩, ${sessionSkip}건 스킵`
  );
}

// ── 성능 검증: EXPLAIN ANALYZE ────────────────────────────────────────────────
async function verifyPerformance(): Promise<void> {
  console.log("\n[성능 검증] EXPLAIN ANALYZE 실행...");

  const dummyVec = `[${Array(1536).fill(0).join(",")}]`;

  const sql = `
    EXPLAIN ANALYZE
    SELECT dish_id, name, 1 - (embedding <=> '${dummyVec}'::vector) AS similarity
    FROM fp_dish
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> '${dummyVec}'::vector
    LIMIT 10;
  `;

  const { data, error } = await supabase.rpc("exec_sql_explain", { sql_text: sql }).single();

  if (error) {
    console.log("  (EXPLAIN ANALYZE RPC 없음 — Dashboard SQL Editor에서 직접 실행하세요)");
    console.log("  SQL:\n" + sql.trim());
  } else {
    console.log("  실행 계획:", JSON.stringify(data, null, 2));
  }
}

async function main(): Promise<void> {
  console.log("=== FreshPickAI 임베딩 백필 스크립트 ===");
  console.log(`  Supabase URL: ${SUPABASE_URL}`);
  console.log(`  BATCH_SIZE: ${BATCH_SIZE}  PAGE_SIZE: ${PAGE_SIZE}`);

  await backfillDishes();
  await backfillRecipes();
  await backfillStoreItems();
  await verifyPerformance();

  console.log("\n✅ 전체 백필 완료");
}

main().catch((err) => {
  console.error("백필 실패:", err);
  process.exit(1);
});
