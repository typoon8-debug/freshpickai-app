import { customAlphabet } from "nanoid";

// 혼동 방지 32문자 (0/O, 1/I/L, B/8 제외) — 36^6 ≈ 21억 가지
const INVITE_ALPHABET = "23456789ACDEFGHJKMNPQRSTUVWXYZ";
const INVITE_LENGTH = 6;

const nano = customAlphabet(INVITE_ALPHABET, INVITE_LENGTH);

export const INVITE_CODE_RE = /^[23456789ACDEFGHJKMNPQRSTUVWXYZ]{6}$/;

export function generateInviteCode(): string {
  return nano();
}

export function isValidInviteCode(code: string): boolean {
  return INVITE_CODE_RE.test(code);
}
