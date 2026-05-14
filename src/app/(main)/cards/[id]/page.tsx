import { notFound } from "next/navigation";
import { getCardDetail } from "@/lib/actions/cards/detail";
import { CardDetailClient } from "@/components/detail/card-detail-client";

type Props = { params: Promise<{ id: string }> };

export default async function CardDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getCardDetail(id);

  if (!detail) notFound();

  return <CardDetailClient detail={detail} />;
}
