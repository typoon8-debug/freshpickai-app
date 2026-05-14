import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildPersonaContext } from "@/lib/ai/persona-context";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await buildPersonaContext(user.id);
  return NextResponse.json(ctx);
}
