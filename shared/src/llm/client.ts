import OpenAI from 'openai';

/**
 * Single shared OpenRouter-compatible LLM client.
 * Reused by the review engine and the architecture verifier.
 * Keys come from the environment: OPEN_AI_API | GEMINI_API_KEY | OPENAI_API_KEY.
 */
export function getLLMClient(): OpenAI {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPEN_AI_API || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY,
  });
}

export const REVIEW_MODEL = 'openai/gpt-4o-mini';
export const EMBEDDING_MODEL = 'text-embedding-3-small';