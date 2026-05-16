import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Vercel Cron은 GET 요청을 사용하므로 dynamic 강제
export const dynamic = "force-dynamic";

/**
 * fp_chat_message_raw TTL 정리 Cron 핸들러
 * 스케줄: vercel.json의 crons 설정 또는 Vercel Dashboard에서 지정
 *
 * 인증: Authorization: Bearer <CRON_SECRET> 헤더 필수
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // Vercel Cron 인증 헤더 검증
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // fp_chat_message_raw: 30일 초과 원문 메시지 삭제
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error, count } = await supabase
    .from("fp_chat_message_raw")
    .delete({ count: "exact" })
    .lt("created_at", cutoff);

  if (error) {
    console.error("[cron/cleanup-chat-memory] 삭제 오류:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.info(`[cron/cleanup-chat-memory] 삭제 완료 — ${count ?? 0}건 (cutoff: ${cutoff})`);

  return NextResponse.json({ deleted: count ?? 0, ok: true });
}
