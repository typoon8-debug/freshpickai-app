import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import AddressManageClient from "@/components/profile/AddressManageClient";
import type { FpAddress } from "@/lib/actions/address/index";

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

  let addresses: FpAddress[] = [];

  if (profile?.ref_customer_id) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("address")
      .select(
        "address_id, address_name, address, addr_detail, receiver_name, receiver_phone, zipcode, message, status, geocoded_at, lat, lng"
      )
      .eq("customer_id", profile.ref_customer_id as string)
      .in("status", ["ACTIVE", "DEFAULT"])
      .order("created_at", { ascending: true });

    addresses = (data ?? []).map((row) => ({
      addressId: row.address_id,
      addressName: row.address_name,
      address: row.address,
      addrDetail: row.addr_detail ?? undefined,
      zipcode: row.zipcode ?? undefined,
      receiverName: row.receiver_name ?? undefined,
      receiverPhone: row.receiver_phone ?? undefined,
      message: row.message ?? "",
      status: row.status,
      geocodedAt: row.geocoded_at ?? null,
      lat: row.lat ?? null,
      lng: row.lng ?? null,
    }));
  }

  return <AddressManageClient initialAddresses={addresses} />;
}
