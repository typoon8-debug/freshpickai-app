/**
 * Supabase Edge Function: cache-cleanup
 *
 * 목적: 만료된 시맨틱 캐시 항목을 정리합니다.
 * 실행: 매일 03:00 KST (18:00 UTC) — Supabase Cron 또는 외부 스케줄러
 *
 * 호출 방법:
 *   POST https://<project>.supabase.co/functions/v1/cache-cleanup
 *   Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 서비스 롤 키로만 실행 허용
  const authHeader = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!authHeader || !serviceKey || !authHeader.includes(serviceKey)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);

    // fp_cleanup_expired_cache() RPC 호출
    const { data, error } = await supabase.rpc("fp_cleanup_expired_cache");

    if (error) throw new Error(`캐시 정리 실패: ${error.message}`);

    const deletedCount = (data as number) ?? 0;

    return new Response(
      JSON.stringify({
        success: true,
        deleted: deletedCount,
        executedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
