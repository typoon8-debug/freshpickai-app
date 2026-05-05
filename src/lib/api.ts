import { createClient } from "@/lib/supabase/client";

type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

function isApiError(data: unknown): data is ApiError {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as ApiError).error === "object"
  );
}

/** fetch 래퍼 — JSON 파싱, 에러 정규화, Supabase 세션 토큰 자동 주입 */
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options?.headers ?? {}),
  };

  if (session?.access_token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data: unknown = await res.json();

  if (!res.ok || isApiError(data)) {
    const err = isApiError(data)
      ? data.error
      : { code: String(res.status), message: res.statusText };
    throw new Error(`[${err.code}] ${err.message}`);
  }

  return data as T;
}
