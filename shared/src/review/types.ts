import { z } from 'zod';

/**
 * Strict schemas for the AI review output.
 * Every LLM response is validated against these before persistence.
 */

export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
export const CATEGORIES = ['bug', 'security', 'performance', 'quality', 'testing', 'architecture'] as const;

export const FindingSchema = z.object({
  severity: z.enum(SEVERITIES),
  category: z.enum(CATEGORIES),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(4000),
  file: z.string().nullish(),
  line: z.number().int().positive().nullish(),
  line_end: z.number().int().positive().nullish(),
  suggestion: z.string().max(2000).nullish(),
  confidence: z.number().min(0).max(1),
});

export type Finding = z.infer<typeof FindingSchema>;

export const ArchitectureImpactSchema = z.object({
  document: z.string().min(1).max(200),
  reason: z.string().min(3).max(2000),
  decisionId: z.string().nullish(),
  decisionTitle: z.string().nullish(),
  conflict: z.boolean().optional().default(false),
});

export type ArchitectureImpact = z.infer<typeof ArchitectureImpactSchema>;

export const DocumentationImpactSchema = z.object({
  document: z.string().min(1).max(200),
  reason: z.string().min(3).max(2000),
});

export type DocumentationImpact = z.infer<typeof DocumentationImpactSchema>;

export const ReviewResultSchema = z.object({
  summary: z.string().min(1).max(2000),
  intent: z.string().min(1).max(2000),
  findings: z.array(FindingSchema).max(50),
  architectureImpact: z.array(ArchitectureImpactSchema).max(20).default([]),
  documentationImpact: z.array(DocumentationImpactSchema).max(20).default([]),
});

export type ReviewResult = z.infer<typeof ReviewResultSchema>;

/** Per-chunk (diff slice) analysis result — same shape, aggregated later. */
export type ChunkAnalysis = z.infer<typeof ChunkAnalysisSchema>;

export const ChunkAnalysisSchema = z.object({
  findings: z.array(FindingSchema).max(20),
});

/** Architecture verifier output: given candidate decisions, was any actually violated? */
export const VerificationResultSchema = z.object({
  conflicts: z.array(
    z.object({
      decisionId: z.string().nullish(),
      decisionTitle: z.string().min(1),
      reason: z.string().min(3).max(2000),
      severity: z.enum(['low', 'medium', 'high']),
      confidence: z.number().min(0).max(1),
    })
  ).max(10),
});

export type VerificationResult = z.infer<typeof VerificationResultSchema>;

/**
 * Validate raw LLM content into a ReviewResult.
 * Returns a discriminated result so the engine can log + retry instead of crashing.
 */
export function parseReviewResult(content: string): { ok: true; data: ReviewResult } | { ok: false; error: string } {
  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
  const parsed = ReviewResultSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: `Schema validation failed: ${parsed.error.message}` };
  }
  return { ok: true, data: parsed.data };
}

/** Validate a single chunk analysis response. */
export function parseChunkAnalysis(content: string): { ok: true; data: ChunkAnalysis } | { ok: false; error: string } {
  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
  const parsed = ChunkAnalysisSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: `Schema validation failed: ${parsed.error.message}` };
  }
  return { ok: true, data: parsed.data };
}

export const ReviewMetaSchema = z.object({
  summary: z.string().min(1).max(2000),
  intent: z.string().min(1).max(2000),
});

export type ReviewMeta = z.infer<typeof ReviewMetaSchema>;

/** Validate the meta extraction (summary + intent) output. */
export function parseReviewMeta(content: string): { ok: true; data: ReviewMeta } | { ok: false; error: string } {
  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
  const parsed = ReviewMetaSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: `Schema validation failed: ${parsed.error.message}` };
  }
  return { ok: true, data: parsed.data };
}

/** Validate the architecture verifier output. */
export function parseVerificationResult(content: string): { ok: true; data: VerificationResult } | { ok: false; error: string } {
  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
  const parsed = VerificationResultSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: `Schema validation failed: ${parsed.error.message}` };
  }
  return { ok: true, data: parsed.data };
}