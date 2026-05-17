import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getAiModelId, AI_MODEL_KEYS } from "@/lib/ai/model-config";
import type { ParsedItem } from "@/app/api/memo/parse/route";

export const maxDuration = 30;

const OCR_PROMPT = `이 이미지는 장보기 메모, 마트 영수증, 또는 식료품 목록입니다.
이미지에서 식품/재료/상품 항목을 추출하세요.

반드시 JSON 배열 형식으로만 응답하세요 (코드블록 없이):
[{"name":"항목이름","qty":수량숫자,"unit":"단위"}]

규칙:
- 이름은 한국어로 표기
- 수량이 없으면 qty: 1, unit: "개"
- 영수증의 경우 품목명만 추출 (가격, 금액 제외)
- 식품/재료가 아닌 항목은 제외
- 최대 30개까지 추출`;

async function extractItemsFromImage(base64Image: string, mimeType: string): Promise<ParsedItem[]> {
  const modelId = await getAiModelId(AI_MODEL_KEYS.CLASSIFY);

  const { text } = await generateText({
    model: anthropic(modelId),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: base64Image,
            mediaType: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
          },
          { type: "text", text: OCR_PROMPT },
        ],
      },
    ],
    maxOutputTokens: 1024,
  });

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  type RawItem = { name?: string; qty?: number; unit?: string };
  const raw = JSON.parse(jsonMatch[0]) as RawItem[];
  return raw
    .filter((r): r is Required<RawItem> => typeof r.name === "string" && r.name.trim().length > 0)
    .map((r) => ({
      name: r.name.trim(),
      qty: typeof r.qty === "number" && r.qty > 0 ? r.qty : 1,
      unit: typeof r.unit === "string" && r.unit.trim() ? r.unit.trim() : "개",
      category: "식재료",
      matched: false,
    }));
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "multipart/form-data 형식으로 전송하세요" }, { status: 400 });
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "image 파일 필수" }, { status: 400 });
  }

  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "이미지 크기는 5MB 이하여야 합니다" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const mimeType = file.type || "image/jpeg";
  if (!allowedTypes.includes(mimeType)) {
    return NextResponse.json({ error: "JPEG, PNG, WEBP 이미지만 지원합니다" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  // Supabase Storage 원본 저장 (버킷 정책으로 30일 TTL 관리)
  const ext = mimeType.split("/")[1] ?? "jpg";
  const storagePath = `${user.id}/${Date.now()}.${ext}`;
  await supabase.storage.from("memo-ocr-images").upload(storagePath, new Uint8Array(arrayBuffer), {
    contentType: mimeType,
    upsert: false,
  });

  const items = await extractItemsFromImage(base64, mimeType);

  if (items.length === 0) {
    return NextResponse.json(
      { error: "이미지에서 식품 항목을 인식하지 못했습니다." },
      { status: 422 }
    );
  }

  return NextResponse.json(items);
}
