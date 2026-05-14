import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, boolean> = { app: true };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("fp_menu_card").select("id").limit(1);
    // PGRST116(no rows)는 DB 정상을 의미 — 쿼리 자체가 성공한 것
    checks.db = !error || error.code === "PGRST116";
  } catch {
    checks.db = false;
  }

  const ok = Object.values(checks).every(Boolean);

  return NextResponse.json({
    status: ok ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
    checks,
  });
}
