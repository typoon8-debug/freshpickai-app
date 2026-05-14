"use server";

import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getAiModelId, AI_MODEL_KEYS } from "@/lib/ai/model-config";

const PASS_SCORE = 4;

/**
 * 사용자 노트 자기보강 루프.
 * helpful_count >= 5 + ai_consent=true 조건 충족 시 호출.
 * LLM Judge가 사실성 4/5 이상 통과 → fp_dish_recipe에 REVIEW_NEEDED 상태로 UPSERT.
 * 자동 ACTIVE 승격 금지 — 운영자 검수 필수.
 */
export async function triggerSelfImprove(
  noteId: string,
  noteBody: string,
  cardId: string
): Promise<void> {
  try {
    const supabase = await createClient();

    // 1. LLM Judge 사실성 평가
    const judgePrompt = `다음 요리 관련 사용자 노트의 사실성을 1~5점으로 평가하세요.

노트 내용:
"${noteBody}"

평가 기준:
- 5점: 명확하고 정확한 요리 정보 (조리법, 재료 비율, 손질법 등)
- 4점: 대체로 유용하고 신뢰할 수 있는 팁
- 3점: 일반적인 내용이지만 문제없음
- 2점: 다소 부정확하거나 주관적인 내용
- 1점: 틀리거나 유해한 정보

점수만 숫자로 답하세요 (예: 4).`;

    const judgeModelId = await getAiModelId(AI_MODEL_KEYS.SELF_IMPROVE);
    const { text } = await generateText({
      model: anthropic(judgeModelId),
      prompt: judgePrompt,
      maxOutputTokens: 10,
    });

    const score = parseInt(text.trim(), 10);
    if (isNaN(score) || score < PASS_SCORE) {
      // 미달 — review_needed를 false로 유지하되 재트리거 방지를 위해 flag
      return;
    }

    // 2. 카드에서 대표 dish_id 조회
    const { data: cardDish } = await supabase
      .from("fp_card_dish")
      .select("dish_id")
      .eq("card_id", cardId)
      .limit(1)
      .single();

    if (!cardDish?.dish_id) return;

    // 3. fp_dish_recipe UPSERT (status='REVIEW_NEEDED', source='user_note')
    await supabase.from("fp_dish_recipe").upsert(
      {
        dish_id: cardDish.dish_id,
        title: `[사용자 노트] ${noteBody.slice(0, 50)}`,
        body: noteBody,
        status: "REVIEW_NEEDED",
        source: "user_note",
        ai_consent: true,
      },
      { onConflict: "dish_id,source" }
    );

    // 4. note review_needed 플래그 ON (재중복 트리거 방지)
    await supabase.from("fp_card_note").update({ review_needed: true }).eq("note_id", noteId);
  } catch {
    // 자기보강 루프 실패는 핵심 기능이 아니므로 무시
  }
}

/**
 * 사용자 노트 → substitutes 자동 병합 큐 (F018 BP3).
 * helpful_count >= 10 + ai_consent=true + note_type='tip' 조건 충족 시 호출.
 * Claude Haiku로 노트에서 대체 재료 제안 추출 → fp_ai_review_queue에 운영자 검수 등록.
 * 자동 fp_ingredient_meta 수정 금지 — 운영자 검수 필수.
 */
export async function triggerSubstituteMerge(noteId: string, noteBody: string): Promise<void> {
  try {
    const supabase = await createClient();

    // LLM으로 노트에서 대체 재료 정보 추출
    const extractPrompt = `다음 요리 팁 노트에서 재료 대체 정보를 추출하세요.

노트: "${noteBody}"

규칙:
- 대체 재료 정보가 있으면 "원재료: 대체재료1, 대체재료2" 형식으로 답하세요.
- 여러 쌍이면 줄바꿈으로 구분하세요.
- 대체 정보가 없으면 "없음"만 답하세요.

예시:
두부: 순두부, 연두부
계란: 두부, 아마씨물`;

    const extractModelId = await getAiModelId(AI_MODEL_KEYS.SELF_IMPROVE);
    const { text } = await generateText({
      model: anthropic(extractModelId),
      prompt: extractPrompt,
      maxOutputTokens: 150,
    });

    const extracted = text.trim();

    // 대체 정보 없으면 종료
    if (extracted === "없음" || !extracted.includes(":")) return;

    // fp_ai_review_queue에 substitute_merge_candidate로 등록
    await supabase.from("fp_ai_review_queue").insert({
      item_name: `[substitutes] ${extracted.split("\n")[0].split(":")[0].trim()}`,
      reason: "substitute_merge_candidate",
      context: JSON.stringify({ noteId, noteBody, extracted }),
      status: "pending",
    });
  } catch {
    // 비핵심 기능 — 실패 무시
  }
}
