import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type SourceApp = "manager" | "sellerbox" | "freshpick" | "rideron";
type EntityType = "store" | "address" | "rider";
type GeocodeStatus = "OK" | "NOT_FOUND" | "ERROR";

export async function recordGeocodeLog(
  supabase: Supabase,
  params: {
    sourceApp: SourceApp;
    entityType: EntityType;
    entityId: string;
    inputAddress: string;
    outputLat?: number | null;
    outputLng?: number | null;
    status: GeocodeStatus;
    errorMsg?: string | null;
    provider?: string;
  }
): Promise<void> {
  const { error } = await supabase.from("geocode_log").insert({
    source_app: params.sourceApp,
    entity_type: params.entityType,
    entity_id: params.entityId,
    input_address: params.inputAddress,
    output_lat: params.outputLat ?? null,
    output_lng: params.outputLng ?? null,
    provider: params.provider ?? "kakao",
    status: params.status,
    error_msg: params.errorMsg ?? null,
  });

  if (error) {
    console.error("[geocode-log] 기록 실패:", error.message);
  }
}
