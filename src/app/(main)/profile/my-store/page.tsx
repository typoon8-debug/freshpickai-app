import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Store, MapPin, Phone, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type StoreInfo = {
  store_id: string;
  store_name: string | null;
  store_address: string | null;
  store_phone: string | null;
  open_time: string | null;
  close_time: string | null;
};

export default async function MyStorePage() {
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

  let storeInfo: StoreInfo | null = null;
  if (profile?.ref_customer_id) {
    const { data: customer } = await supabase
      .from("customer")
      .select("store_id")
      .eq("customer_id", profile.ref_customer_id as string)
      .single();

    if (customer?.store_id) {
      const { data: store } = await supabase
        .from("store")
        .select("store_id, store_name, store_address, store_phone, open_time, close_time")
        .eq("store_id", customer.store_id as string)
        .single();
      storeInfo = (store as StoreInfo) ?? null;
    }
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="border-line bg-paper sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
        <Link href="/profile" aria-label="뒤로가기">
          <ChevronLeft size={22} className="text-ink-700" />
        </Link>
        <h1 className="text-ink-800 flex-1 text-base font-bold">내가게</h1>
      </header>

      {!storeInfo ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Store size={48} className="text-ink-200" />
          <p className="text-ink-500 text-sm font-medium">연결된 스토어가 없어요</p>
          <p className="text-ink-400 text-xs">고객 계정과 연동된 스토어를 확인해보세요</p>
          <Link
            href="/category"
            className="bg-mocha-700 text-paper mt-2 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {/* 스토어 헤더 */}
          <div className="border-line rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-mocha-100 flex h-12 w-12 items-center justify-center rounded-full text-2xl">
                🏪
              </div>
              <div>
                <h2 className="text-ink-900 text-base font-bold">
                  {storeInfo.store_name ?? "내 스토어"}
                </h2>
                <p className="text-mocha-600 text-xs">나의 단골 스토어</p>
              </div>
            </div>

            <ul className="space-y-2.5">
              {storeInfo.store_address && (
                <li className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-mocha-400 mt-0.5 shrink-0" />
                  <span className="text-ink-600 text-sm">{storeInfo.store_address}</span>
                </li>
              )}
              {storeInfo.store_phone && (
                <li className="flex items-center gap-2.5">
                  <Phone size={15} className="text-mocha-400 shrink-0" />
                  <span className="text-ink-600 text-sm">{storeInfo.store_phone}</span>
                </li>
              )}
              {(storeInfo.open_time ?? storeInfo.close_time) && (
                <li className="flex items-center gap-2.5">
                  <Clock size={15} className="text-mocha-400 shrink-0" />
                  <span className="text-ink-600 text-sm">
                    {storeInfo.open_time ?? ""}
                    {storeInfo.open_time && storeInfo.close_time ? " ~ " : ""}
                    {storeInfo.close_time ?? ""}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* 바로가기 */}
          <Link
            href="/category"
            className="bg-mocha-700 text-paper hover:bg-mocha-900 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition"
          >
            <Store size={16} />
            스토어 쇼핑하기
          </Link>
        </div>
      )}
    </div>
  );
}
