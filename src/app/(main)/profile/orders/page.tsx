import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrdersClient from "@/components/profile/OrdersClient";
import { getOrdersWithDetails } from "@/lib/actions/orders/index";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orders = await getOrdersWithDetails();

  return <OrdersClient initialOrders={orders} />;
}
