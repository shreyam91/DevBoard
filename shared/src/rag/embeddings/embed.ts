import OpenAI from 'openai';
import { EMBEDDING_MODEL, getLLMClient } from '../../llm/client';

// 1536 = text-embedding-3-small. Hard-coding this makes the raw-SQL matrix easy
// to reason about and keeps the code honest — if someone changes the model this
// constant needs updating intentionally.
export const EMBEDDING_DIM = 1536 as const;

let cached: OpenAI | null = null;

function client(): OpenAI {
  if (!cached) cached = getLLMClient();
  return cached;
}

/**
 * Generate an embedding vector for a single piece of text.
 */
export async function embedText(text: string): Promise<number[]> {
  if (!text.trim()) return Array(EMBEDDING_DIM).fill(0);

  const res = await client().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    encoding_format: 'float',
  });
  return res.data[0].embedding;
}

/**
 * Batch-embed an array of texts (<= 100 per OpenAI batch limit).
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const out: number[][] = [];
  const BATCH = 64;
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH).map((t) => t.trim() || ' ');
    const res = await client().embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      encoding_format: 'float',
    });
    out.push(...res.data.map((d) => d.embedding));
  }
  return out;
}