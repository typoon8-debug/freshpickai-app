import { NextResponse } from "next/server";
import { getFamilyGroup, getFamilyMembers, createFamilyGroup } from "@/lib/actions/family";

export async function GET() {
  const [group, members] = await Promise.all([getFamilyGroup(), getFamilyMembers()]);

  if (!group) {
    return NextResponse.json({ group: null, members: [] });
  }

  return NextResponse.json({ group, members });
}

export async function POST(req: Request) {
  const { name } = (await req.json()) as { name?: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const group = await createFamilyGroup(name.trim());

  if (!group) {
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }

  return NextResponse.json(group, { status: 201 });
}
