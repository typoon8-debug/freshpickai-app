import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { getAiModelId, AI_MODEL_KEYS } from "./model-config";

const MAX_INPUT_CHARS = 8000;
const DEFAULT_BATCH_SIZE = 100;

export async function embedText(text: string): Promise<number[]> {
  const modelId = await getAiModelId(AI_MODEL_KEYS.EMBEDDING);
  const { embedding } = await embed({
    model: openai.embedding(modelId),
    value: text.slice(0, MAX_INPUT_CHARS),
  });
  return embedding;
}

export async function embedBatch(
  texts: string[],
  batchSize = DEFAULT_BATCH_SIZE
): Promise<number[][]> {
  const modelId = await getAiModelId(AI_MODEL_KEYS.EMBEDDING);
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const { embeddings } = await embedMany({
      model: openai.embedding(modelId),
      values: batch.map((t) => t.slice(0, MAX_INPUT_CHARS)),
    });
    results.push(...embeddings);
  }
  return results;
}

export function embeddingToSql(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
