import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { castVote, getVoteResults, getCurrentVoteSession } from "@/lib/actions/family/vote";

// GET /api/family/vote?groupId=xxx — 현재 세션 + 투표 결과 조회
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const groupId = req.nextUrl.searchParams.get("groupId");
  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  const session = await getCurrentVoteSession(groupId);
  if (!session) {
    return NextResponse.json({ session: null, results: [] });
  }

  const results = await getVoteResults(session.sessionId);
  return NextResponse.json({ session, results });
}

// POST /api/family/vote — 투표 등록
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { groupId?: string; sessionId?: string; cardId?: string; voteType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { groupId, sessionId, cardId, voteType } = body;
  if (!groupId || !sessionId || !cardId || !voteType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (voteType !== "like" && voteType !== "dislike") {
    return NextResponse.json({ error: "Invalid voteType" }, { status: 400 });
  }

  const result = await castVote(groupId, sessionId, cardId, voteType);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
