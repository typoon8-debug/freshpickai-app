import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MyStoreClient from "@/components/profile/MyStoreClient";
import { getMyShops } from "@/lib/actions/store/index";

export default async function MyStorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { shops, currentStoreId } = await getMyShops();

  return <MyStoreClient initialShops={shops} initialCurrentStoreId={currentStoreId} />;
}
