"use server";

import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { MovieNightCard } from "@/lib/types";
import { getAiModelId, AI_MODEL_KEYS } from "@/lib/ai/model-config";

// ── 무비나이트 장르 옵션 ─────────────────────────────────────
export const MOVIE_GENRES = [
  "로맨스",
  "액션",
  "공포",
  "가족",
  "SF",
  "애니",
  "스릴러",
  "코미디",
] as const;

export type MovieGenre = (typeof MOVIE_GENRES)[number];

// ── 장르 투표 집계 조회 ──────────────────────────────────────
export async function getMovieGenreVotes(groupId: string): Promise<Record<MovieGenre, number>> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("fp_family_vote")
    .select("card_id, vote_type")
    .eq("group_id", groupId)
    .in("card_id", MOVIE_GENRES as unknown as string[]);

  const counts = Object.fromEntries(MOVIE_GENRES.map((g) => [g, 0])) as Record<MovieGenre, number>;

  (data ?? []).forEach((row) => {
    if (row.vote_type === "like" && row.card_id in counts) {
      counts[row.card_id as MovieGenre]++;
    }
  });

  return counts;
}

// ── 무비나이트 홈시네마 카드 자동 생성 ────────────────────────
export async function triggerMovieNight(
  groupId: string,
  topGenre?: MovieGenre
): Promise<{ ok: boolean; cards?: MovieNightCard[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };

  // 장르 결정: 파라미터 없으면 가장 많이 받은 장르 사용
  let genre = topGenre;
  if (!genre) {
    const counts = await getMovieGenreVotes(groupId);
    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
    genre = (sorted[0]?.[0] as MovieGenre) ?? "가족";
  }

  const MovieNightSchema = z.object({
    adult: z.object({
      name: z.string(),
      subtitle: z.string(),
      emoji: z.string(),
      description: z.string(),
      dishes: z.array(
        z.object({
          name: z.string(),
          pairingReason: z.string(),
        })
      ),
      beverage: z.string(),
    }),
    kids: z.object({
      name: z.string(),
      subtitle: z.string(),
      emoji: z.string(),
      description: z.string(),
      dishes: z.array(
        z.object({
          name: z.string(),
          pairingReason: z.string(),
        })
      ),
      beverage: z.string(),
    }),
  });

  let generated;
  try {
    const movieModelId = await getAiModelId(AI_MODEL_KEYS.MOVIE_NIGHT);
    const result = await generateObject({
      model: anthropic(movieModelId),
      schema: MovieNightSchema,
      prompt: `당신은 홈시네마 나이트 전문 푸드 큐레이터입니다.
오늘의 무비 장르: "${genre}"

${genre} 장르 영화와 완벽하게 어울리는 홈시네마 나이트 페어링 메뉴를 2가지 버전으로 추천해주세요:
1. 성인용 버전 - 분위기에 맞는 음식과 주류 포함 가능
2. 키즈용 무알콜 버전 - 어린이도 즐길 수 있는 무알콜 음료와 간식 중심

각 버전마다:
- 카드 이름 (20자 이내, 장르 느낌 반영)
- 부제목 (15자 이내)
- 대표 이모지
- 짧은 설명 (50자 이내)
- 메인 음식 3개 (이름 + 페어링 이유 1줄)
- 추천 음료 1개

응답은 반드시 JSON 형식으로 작성하세요.`,
    });
    generated = result.object;
  } catch {
    return { ok: false, error: "AI_GENERATION_FAILED" };
  }

  // fp_menu_card에 두 카드 저장
  const timestamp = Date.now();
  const adultCardId = `movie-night-adult-${timestamp}`;
  const kidsCardId = `movie-night-kids-${timestamp}`;

  const cardsToInsert = [
    {
      card_id: adultCardId,
      owner_user_id: user.id,
      card_theme: "cinema_night",
      name: generated.adult.name,
      subtitle: generated.adult.subtitle,
      category: "cinema",
      emoji: generated.adult.emoji,
      description: generated.adult.description,
      is_official: false,
      is_new: true,
      review_status: "private",
    },
    {
      card_id: kidsCardId,
      owner_user_id: user.id,
      card_theme: "cinema_night",
      name: generated.kids.name,
      subtitle: generated.kids.subtitle,
      category: "cinema",
      emoji: generated.kids.emoji,
      description: generated.kids.description,
      is_official: false,
      is_new: true,
      review_status: "private",
    },
  ];

  const { error: insertError } = await supabase.from("fp_menu_card").insert(cardsToInsert);

  if (insertError) return { ok: false, error: insertError.message };

  return {
    ok: true,
    cards: [
      {
        cardId: adultCardId,
        name: generated.adult.name,
        subtitle: generated.adult.subtitle,
        emoji: generated.adult.emoji,
        isKidsVersion: false,
      },
      {
        cardId: kidsCardId,
        name: generated.kids.name,
        subtitle: generated.kids.subtitle,
        emoji: generated.kids.emoji,
        isKidsVersion: true,
      },
    ],
  };
}
