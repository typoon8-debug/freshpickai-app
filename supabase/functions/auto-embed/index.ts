/**
 * Supabase Edge Function: auto-embed
 *
 * 트리거: v_store_inventory_item.ai_status → 'ACTIVE' 변경 시 호출
 * 역할:  상품 텍스트 임베딩 생성 → fp_store_item_embedding upsert
 *
 * 호출 방법 (Database Webhook 또는 직접 호출):
 *   POST https://<project>.supabase.co/functions/v1/auto-embed
 *   Authorization: Bearer <SUPABASE_ANON_KEY>
 *   Content-Type: application/json
 *   Body: { "store_item_id": "uuid", "item_name": "...", "ai_ad_copy": "...", "ai_tags": ["..."] }
 *
 * 또는 Supabase Database Webhook으로 tenant_item_ai_detail INSERT/UPDATE 시 자동 호출
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_URL = "https://api.openai.com/v1/embeddings";
const EMBEDDING_MODEL = "text-embedding-3-small";
const MAX_CHARS = 8000;

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.slice(0, MAX_CHARS),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embedding API 오류: ${err}`);
  }

  const json = await response.json();
  return json.data[0].embedding as number[];
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Supabase Database Webhook 형식 지원 (record 래핑)
    const record = payload.record ?? payload;
    const { store_item_id, item_name, ai_ad_copy, ai_tags, ai_status } = record as {
      store_item_id: string;
      item_name: string | null;
      ai_ad_copy: string | null;
      ai_tags: string[] | null;
      ai_status: string | null;
    };

    if (!store_item_id) {
      return new Response(JSON.stringify({ error: "store_item_id 필수" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ai_status가 ACTIVE가 아닌 경우 스킵 (Webhook에서 전달되는 경우)
    if (ai_status && ai_status !== "ACTIVE") {
      return new Response(JSON.stringify({ skipped: true, reason: "ai_status != ACTIVE" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = [item_name ?? "", ai_ad_copy ?? "", (ai_tags ?? []).join(" ")]
      .filter(Boolean)
      .join(" ");

    const embedding = await generateEmbedding(text);
    const embeddingStr = `[${embedding.join(",")}]`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { error } = await supabase.from("fp_store_item_embedding").upsert(
      {
        store_item_id,
        item_name,
        embedding: embeddingStr,
        embedded_at: new Date().toISOString(),
      },
      { onConflict: "store_item_id" }
    );

    if (error) throw new Error(`upsert 실패: ${error.message}`);

    return new Response(JSON.stringify({ success: true, store_item_id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
