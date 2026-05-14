import { NextResponse, type NextRequest } from "next/server";
import { MOCK_CARDS } from "@/data/mock-cards";
import { getMockDish } from "@/data/mock-dishes";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = MOCK_CARDS.find((c) => c.cardId === id);

  if (!card) {
    return NextResponse.json({ data: null, error: "Card not found" }, { status: 404 });
  }

  const { dish, ingredients } = getMockDish(id);

  return NextResponse.json({
    data: { card, dish, ingredients },
    error: null,
  });
}
