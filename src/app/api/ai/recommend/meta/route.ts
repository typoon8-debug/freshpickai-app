import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const DEFAULT_INTERVAL_HOURS = 168;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  const [intervalResult, customerResult] = await Promise.all([
    adminClient
      .from("common_code")
      .select("description")
      .eq("code", "AI_RECOMMEND_INTERVAL")
      .maybeSingle(),
    adminClient
      .from("customer")
      .select("ai_recommend_generated_at")
      .eq("email", user.email)
      .maybeSingle(),
  ]);

  const intervalHours =
    parseInt(intervalResult.data?.description ?? `${DEFAULT_INTERVAL_HOURS}`, 10) ||
    DEFAULT_INTERVAL_HOURS;

  const generatedAt = customerResult.data?.ai_recommend_generated_at as string | null | undefined;

  let stale = true;
  if (generatedAt) {
    const diffMs = Date.now() - new Date(generatedAt).getTime();
    stale = diffMs > intervalHours * 60 * 60 * 1000;
  }

  return NextResponse.json({ stale, intervalHours });
}
