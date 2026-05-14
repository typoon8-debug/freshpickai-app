import { notFound } from "next/navigation";
import { getMemoDetailAction } from "@/lib/actions/memo";
import { MemoEditor } from "@/components/memo/memo-editor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MemoEditPage({ params }: Props) {
  const { id } = await params;
  const detail = await getMemoDetailAction(id);

  if (!detail) notFound();

  return <MemoEditor memoId={id} initialMemo={detail.memo} initialItems={detail.items} />;
}
