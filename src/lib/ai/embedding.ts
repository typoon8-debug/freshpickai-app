import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

const embeddingModel = openai.embedding("text-embedding-3-small");

const MAX_INPUT_CHARS = 8000;
const DEFAULT_BATCH_SIZE = 100;

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text.slice(0, MAX_INPUT_CHARS),
  });
  return embedding;
}

export async function embedBatch(
  texts: string[],
  batchSize = DEFAULT_BATCH_SIZE
): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: batch.map((t) => t.slice(0, MAX_INPUT_CHARS)),
    });
    results.push(...embeddings);
  }
  return results;
}

export function embeddingToSql(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
