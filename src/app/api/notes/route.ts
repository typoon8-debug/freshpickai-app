import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CardNote } from "@/lib/types";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cardId = searchParams.get("cardId");
  const noteType = searchParams.get("type") as CardNote["noteType"] | null;
  const sort = searchParams.get("sort") ?? "latest";

  if (!cardId) {
    return NextResponse.json({ error: "cardId 파라미터 필요" }, { status: 400 });
  }

  let query = supabase
    .from("fp_card_note")
    .select("*")
    .eq("card_id", cardId)
    .order(sort === "helpful" ? "helpful_count" : "created_at", { ascending: false });

  if (noteType) {
    query = query.eq("note_type", noteType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const notes: CardNote[] = (data ?? []).map((row) => ({
    noteId: row.note_id,
    cardId: row.card_id,
    userId: row.user_id,
    noteType: row.note_type as CardNote["noteType"],
    body: row.body,
    helpfulCount: row.helpful_count,
    aiConsent: row.ai_consent,
    adminReply: row.admin_reply ?? undefined,
    createdAt: row.created_at,
  }));

  return NextResponse.json(notes);
}
