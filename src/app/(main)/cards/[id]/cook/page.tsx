import { notFound } from "next/navigation";
import { getCookModeDataAction } from "@/lib/actions/cards/recipe-steps";
import { getBookmarkStatusAction } from "@/lib/actions/cards/bookmark";
import { CookModeClient } from "@/components/cook/cook-mode-client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  void id;
  return { title: "요리하기" };
}

export default async function CookPage({ params }: Props) {
  const { id } = await params;

  const [data, bookmark] = await Promise.all([
    getCookModeDataAction(id),
    getBookmarkStatusAction(id),
  ]);

  if (!data) notFound();

  return <CookModeClient data={data} initialBookmarked={bookmark.isBookmarked} />;
}
