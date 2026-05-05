type Props = {
  params: Promise<{ id: string }>;
};

export default async function CardDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-mocha-900 text-2xl">카드 상세</h1>
      <p className="text-ink-500 mt-1 text-sm">ID: {id}</p>
    </div>
  );
}
