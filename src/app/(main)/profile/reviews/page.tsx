import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { TopHeader } from "@/components/layout/top-header";
import { createClient } from "@/lib/supabase/server";

type Review = {
  id: string;
  rating: number | null;
  content: string | null;
  created_at: string;
};

export default async function ReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("fp_user_profile")
    .select("ref_customer_id")
    .eq("user_id", user.id)
    .single();

  let reviews: Review[] = [];
  if (profile?.ref_customer_id) {
    const { data } = await supabase
      .from("review")
      .select("id, rating, content, created_at")
      .eq("customer_id", profile.ref_customer_id as string)
      .order("created_at", { ascending: false })
      .limit(50);
    reviews = (data ?? []) as Review[];
  }

  return (
    <div className="min-h-screen pb-12">
      <TopHeader title="구매후기" backHref="/profile" />

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Star size={48} className="text-ink-200" />
          <p className="text-ink-500 text-sm font-medium">작성한 후기가 없어요</p>
          <p className="text-ink-400 text-xs">구매 후 솔직한 리뷰를 남겨보세요</p>
        </div>
      ) : (
        <ul className="divide-line divide-y">
          {reviews.map((review) => {
            const stars = review.rating ?? 0;
            const date = new Date(review.created_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            return (
              <li key={review.id} className="px-4 py-4">
                <div className="mb-1 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={i < stars ? "fill-honey text-honey" : "text-ink-200"}
                    />
                  ))}
                  <span className="text-ink-400 ml-1 text-xs">{date}</span>
                </div>
                {review.content && (
                  <p className="text-ink-700 text-sm leading-relaxed">{review.content}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
