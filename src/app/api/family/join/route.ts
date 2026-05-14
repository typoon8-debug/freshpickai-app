import { NextResponse } from "next/server";
import { joinFamilyByInvite } from "@/lib/actions/family/invite";

export async function POST(req: Request) {
  const { inviteCode } = (await req.json()) as { inviteCode?: string };

  if (!inviteCode?.trim()) {
    return NextResponse.json({ error: "inviteCode is required" }, { status: 400 });
  }

  const result = await joinFamilyByInvite(inviteCode.trim());

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
