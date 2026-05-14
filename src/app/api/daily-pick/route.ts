import { NextResponse } from "next/server";
import { getDailyPick } from "@/lib/actions/cards";

export async function GET() {
  const card = await getDailyPick();

  if (!card) {
    return NextResponse.json({ error: "No daily pick available" }, { status: 404 });
  }

  return NextResponse.json(card);
}
