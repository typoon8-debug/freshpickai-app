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

  return NextResponse.json(cards);
}
