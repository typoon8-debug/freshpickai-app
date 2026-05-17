import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveAndExtractMemory } from "@/lib/chat/memory/store";

export const maxDuration = 30;

type FlushBody = {
  sessionId?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
};

/**
 * 페이지 이탈 시 navigator.sendBeacon()으로 호출되는 엔드포인트
 * 대화 세션 요약 + 장기 기억 추출을 즉시 수행합니다.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return new Response(null, { status: 401 });

    const body = (await req.json()) as FlushBody;
    const { sessionId, messages } = body;

    if (!sessionId || !messages || messages.length < 2) {
      return new Response(null, { status: 204 });
    }

    await saveAndExtractMemory(user.id, sessionId, messages);
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}
