const REQUIRED_PUBLIC_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

const REQUIRED_SERVER_ENV = ["SUPABASE_SERVICE_ROLE_KEY", "ANTHROPIC_API_KEY"] as const;

/** 빌드타임 환경변수 누락 시 에러 throw */
export function validateEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_PUBLIC_ENV) {
    if (!process.env[key]) missing.push(key);
  }

  if (typeof window === "undefined") {
    for (const key of REQUIRED_SERVER_ENV) {
      if (!process.env[key]) missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`[env] 필수 환경변수 누락: ${missing.join(", ")}`);
  }
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
} as const;
