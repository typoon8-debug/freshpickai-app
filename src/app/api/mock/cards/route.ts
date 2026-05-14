import { NextResponse, type NextRequest } from "next/server";
import { MOCK_CARDS } from "@/data/mock-cards";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const theme = searchParams.get("theme");

  let cards = MOCK_CARDS;

  if (category) {
    cards = cards.filter((c) => c.category === category);
  }
  if (theme) {
    cards = cards.filter((c) => c.cardTheme === theme);
  }

  return NextResponse.json({ data: cards, error: null });
}
