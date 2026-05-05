import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** 가격을 한국어 형식으로 포맷 (예: 12000 → '12,000원') */
export function formatPrice(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}

/** 날짜를 'M월 D일' 형식으로 포맷 */
export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** 새벽배송 도착 시간 문자열 반환 (내일 오전 6시 기준) */
export function formatDeliveryTime(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `${tomorrow.getMonth() + 1}월 ${tomorrow.getDate()}일 오전 6시`;
}
