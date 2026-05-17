import { NextResponse } from "next/server";
import { joinFamilyByInvite } from "@/lib/actions/family/invite";
import type { RelationshipType } from "@/lib/constants/relationship";

export async function POST(req: Request) {
  const body = (await req.json()) as { inviteCode?: string; relationship?: RelationshipType };

  if (!body.inviteCode?.trim()) {
    return NextResponse.json({ error: "inviteCode is required" }, { status: 400 });
  }

  const result = await joinFamilyByInvite(body.inviteCode.trim(), body.relationship);

  if (!result.success) {
    const statusMap: Record<string, number> = {
      AUTH_REQUIRED: 401,
      CODE_INVALID: 404,
      CODE_EXPIRED: 410,
      CODE_EXHAUSTED: 409,
      JOIN_FAILED: 500,
    };
    return NextResponse.json({ error: result.error }, { status: statusMap[result.error] ?? 400 });
  }

  return NextResponse.json(result);
}
