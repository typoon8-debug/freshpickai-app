import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Address = {
  address_id: string;
  address_name: string | null;
  address: string | null;
  addr_detail: string | null;
  receiver_name: string | null;
  receiver_phone: string | null;
  zipcode: string | null;
  status: string | null;
};

export default async function AddressesPage() {
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

  let addresses: Address[] = [];
  if (profile?.ref_customer_id) {
    const { data } = await supabase
      .from("address")
      .select(
        "address_id, address_name, address, addr_detail, receiver_name, receiver_phone, zipcode, status"
      )
      .eq("customer_id", profile.ref_customer_id as string)
      .neq("status", "DELETED")
      .order("created_at", { ascending: false });
    addresses = (data ?? []) as Address[];
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="border-line bg-paper sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
        <Link href="/profile" aria-label="뒤로가기">
          <ChevronLeft size={22} className="text-ink-700" />
        </Link>
        <h1 className="text-ink-800 flex-1 text-base font-bold">배송지 관리</h1>
      </header>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <MapPin size={48} className="text-ink-200" />
          <p className="text-ink-500 text-sm font-medium">등록된 배송지가 없어요</p>
          <p className="text-ink-400 text-xs">주문 시 배송지를 등록해보세요</p>
        </div>
      ) : (
        <ul className="space-y-3 p-4">
          {addresses.map((addr) => (
            <li
              key={addr.address_id}
              className="border-line rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-mocha-500 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  {addr.address_name && (
                    <p className="text-mocha-700 mb-1 text-xs font-bold">{addr.address_name}</p>
                  )}
                  <p className="text-ink-800 text-sm leading-snug">
                    {addr.address}
                    {addr.addr_detail ? ` ${addr.addr_detail}` : ""}
                  </p>
                  {addr.zipcode && <p className="text-ink-400 mt-0.5 text-xs">[{addr.zipcode}]</p>}
                  {addr.receiver_name && (
                    <p className="text-ink-500 mt-1 text-xs">
                      {addr.receiver_name}
                      {addr.receiver_phone ? ` · ${addr.receiver_phone}` : ""}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
