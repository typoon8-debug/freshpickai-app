import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;
import { searchByVector, VectorSearchTable, VectorSearchOptions } from "@/lib/ai/vector-search";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q");
  const table = (searchParams.get("table") ?? "dish") as VectorSearchTable;
  const limit = Number(searchParams.get("limit") ?? "10");
  const threshold = Number(searchParams.get("threshold") ?? "0.5");
  const dietTags = searchParams.get("dietTags")?.split(",").filter(Boolean);
  const personaTags = searchParams.get("personaTags")?.split(",").filter(Boolean);
  const aiTags = searchParams.get("aiTags")?.split(",").filter(Boolean);

  if (!query) {
    return NextResponse.json({ error: "q 파라미터 필수" }, { status: 400 });
  }

  if (!["dish", "recipe", "store_item"].includes(table)) {
    return NextResponse.json({ error: "table은 dish|recipe|store_item 중 하나" }, { status: 400 });
  }

  const options: VectorSearchOptions = {
    table,
    limit: Math.min(limit, 50),
    threshold,
    filters: {
      ...(dietTags?.length && { dietTags }),
      ...(personaTags?.length && { personaTags }),
      ...(aiTags?.length && { aiTags }),
    },
  };

  try {
    const start = Date.now();
    const results = await searchByVector(query, options);
    const elapsed = Date.now() - start;

    return NextResponse.json({
      query,
      table,
      count: results.length,
      elapsed_ms: elapsed,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "검색 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
