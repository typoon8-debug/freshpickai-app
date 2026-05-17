import { NextResponse } from "next/server";
import { getCards } from "@/lib/actions/cards";
import type { CardTheme } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const theme = searchParams.get("theme") as CardTheme | null;
  const category = searchParams.get("category") as "meal" | "snack" | "cinema" | null;
  const official = searchParams.get("official");
  const aiTagsParam = searchParams.get("aiTags");
  const aiTags = aiTagsParam ? aiTagsParam.split(",").filter(Boolean) : undefined;

  const cards = await getCards({
    theme: theme ?? undefined,
    category: category ?? undefined,
    officialOnly: official === "true",
    aiTags,
  });

  // 공개 공식 카드: Vercel Edge CDN에 5분 캐시 (서버 측 unstable_cache와 동일 TTL)
  // AI 태그 필터 조합: 120초 캐시 (URL별로 CDN 슬롯 분리되어 안전)
  const cacheControl =
    official === "true" && !aiTags
      ? "public, s-maxage=300, stale-while-revalidate=60"
      : aiTags
        ? "public, s-maxage=120, stale-while-revalidate=30"
        : "no-store";

  return NextResponse.json(cards, {
    headers: { "Cache-Control": cacheControl },
  });
}
