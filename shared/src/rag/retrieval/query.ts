/**
 * Vector retrieval over the Document table, scoped to a repository.
 *
 * RULE: every query MUST include `repo_id = $X` as the very first WHERE clause.
 * This is the hard boundary that makes repository isolation mathematically correct:
 * pgvector can never surface a document belonging to a different repository.
 */

import { prisma } from '../../prisma';
import { embedText } from '../embeddings/embed';
import type { DocMetadata, RetrievedChunk } from '../types';
import type { MetadataFilter } from './filters';

// Maximum candidates we ask for from pgvector. Reranking will take the top-K
// from this pool, so this should be comfortably larger than your target context
// window (5-8 chunks).
const MAX_CANDIDATES = 30;

/**
 * Build a WHERE clause body (after the repo_id filter) from metadata filters.
 * Returns [clause, params] where params are positional ($N) args.
 *
 * `startIdx` is the first positional parameter to use. In the composed query
 * $1 = repoId and $2 = embedding, so filters MUST begin at $3 or their numbers
 * would collide with the repoId/embedding params.
 */
function buildFilterClause(filters: MetadataFilter[], startIdx = 3): [string, unknown[]] {
  const parts: string[] = [];
  const params: unknown[] = [];
  let idx = startIdx;

  for (const f of filters) {
    if (f.sourceType) {
      parts.push(`(m->>'sourceType')::text = $${idx++}`);
      params.push(f.sourceType);
    }
    if (f.prNumber != null) {
      parts.push(`(m->>'prNumber')::int = $${idx++}`);
      params.push(f.prNumber);
    }
    if (f.issueNumber != null) {
      parts.push(`(m->>'issueNumber')::int = $${idx++}`);
      params.push(f.issueNumber);
    }
    if (f.adrId) {
      parts.push(`(m->>'adrId')::text = $${idx++}`);
      params.push(f.adrId);
    }
    if (f.filePathPrefix) {
      parts.push(`(m->>'filePath')::text ILIKE $${idx++}`);
      params.push(`${f.filePathPrefix}%`);
    }
    if (f.documentType) {
      parts.push(`(m->>'documentType')::text = $${idx++}`);
      params.push(f.documentType);
    }
  }

  return [parts.length > 0 ? parts.join(' AND ') : 'TRUE', params];
}

export interface RetrievalQuery {
  sql: string;
  params: unknown[];
}

/**
 * Compose the retrieval SQL and positional params for one repository.
 *
 * ISOLATION CONTRACT: `repo_id = $1` is ALWAYS the first condition and `$1` is
 * ALWAYS the repoId. No code path, here or in callers, can reorder or drop this
 * clause — it is the boundary that keeps one project's documents out of another's
 * chat. Exposed separately from execution so the invariant is unit-testable
 * without a database connection.
 */
export function buildRetrievalQuery(repoId: string, filters: MetadataFilter[], limit: number, embedding: number[]): RetrievalQuery {
  const [filterClause, filterParams] = buildFilterClause(filters);
  const sql = `
    SELECT
      d.id            AS "docId",
      d.repo_id       AS "repoId",
      d.title         AS "title",
      d.content       AS "content",
      d.metadata      AS "metadata",
      (d.embedding <=> $2::vector) AS "distance"
    FROM documents d
    WHERE d.repo_id = $1
      AND d.embedding IS NOT NULL
      AND ${filterClause}
    ORDER BY d.embedding <=> $2::vector
    LIMIT $${filterParams.length + 3};
  `;
  return {
    sql,
    params: [repoId, `[${embedding.join(',')}]`, ...filterParams, limit],
  };
}

/**
 * Core retrieval: embed the query, then run a vector + metadata filtered search
 * scoped to a single repository. Never returns results from other repos.
 */
export async function retrieve({
  repoId,
  question,
  filters = [],
  limit = MAX_CANDIDATES,
}: {
  repoId: string;
  question: string;
  filters?: MetadataFilter[];
  limit?: number;
}): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedText(question);
  const { sql, params } = buildRetrievalQuery(repoId, filters, limit, queryEmbedding);

  const rows: { docId: string; repoId: string; title: string; content: string; metadata: any; distance: number }[] =
    await prisma.$queryRawUnsafe(sql, ...params);

  return rows.map((r) => ({
    docId: r.docId,
    repoId: r.repoId,
    title: r.title,
    content: r.content,
    metadata: (r.metadata ?? {}) as DocMetadata,
    distance: Number(r.distance),
  }));
}

/**
 * Fallback: retrieve the most recent architecture + overview chunks for a repo
 * when semantic retrieval produces no useful results.
 */
export async function retrieveFallback(repoId: string): Promise<RetrievedChunk[]> {
  const rows: { docId: string; repoId: string; title: string; content: string; metadata: any; distance: number }[] =
    await prisma.$queryRawUnsafe(
      `SELECT
        d.id            AS "docId",
        d.repo_id       AS "repoId",
        d.title         AS "title",
        d.content       AS "content",
        d.metadata      AS "metadata",
        0.5             AS "distance"
      FROM documents d
      WHERE d.repo_id = $1
        AND (d.metadata->>'sourceType')::text IN ('adr','architecture','documentation')
      ORDER BY d.created_at DESC
      LIMIT $2`,
      repoId,
      8,
    );
  return rows.map((r) => ({
    docId: r.docId,
    repoId: r.repoId,
    title: r.title,
    content: r.content,
    metadata: (r.metadata ?? {}) as DocMetadata,
    distance: Number(r.distance),
  }));
}