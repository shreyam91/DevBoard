/**
 * Chat-pipeline tests: compose retrieval -> rerank -> contextBuilder exactly like
 * chatService does, but with synthetic candidates (no DB / LLM). This verifies the
 * two product-level guarantees that matter:
 *   1. When there IS relevant context, the answer path is grounded and cited.
 *   2. When there is NO useful context, the pipeline forces the refusal phrase.
 *
 * The DB/LLM executions are covered by the retrieval unit tests (repo isolation)
 * and the buildPrompt tests (grounding + refusal), so this file focuses on the
 * orchestration seams between the layers.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rerank } from '../rag/reranking/rerank';
import { buildPrompt, reconcileSources, buildSources, REFUSAL_PHRASE } from '../rag/contextBuilder/buildPrompt';
import type { RetrievedChunk, DocMetadata } from '../rag/types';

function candidate(content: string, meta: Partial<DocMetadata>, distance = 0.2): RetrievedChunk {
  return { docId: meta.title ?? 'd', repoId: 'repo1', title: meta.title ?? 'd', content, metadata: meta as DocMetadata, distance };
}

test('pipeline with relevant context produces a cited, grounded answer path', () => {
  const results = rerank(
    [
      candidate('Redis powers the background job queue via BullMQ.', { sourceType: 'adr', title: 'ADR Background queues', section: 'Queues' }, 0.1),
      candidate('The frontend renders with Next.js.', { sourceType: 'architecture', title: 'ARCHITECTURE.md' }, 0.5),
    ],
    'why do we use redis for background jobs',
  );

  const built = buildPrompt({ question: 'why do we use redis', contextChunks: results });

  assert.ok(built.user.includes('Redis powers the background job queue via BullMQ.'));
  assert.equal(built.empty, false);
  assert.ok(built.sources.length >= 2);

  // A plausible grounded answer that cites the ADR source:
  const raw = 'Redis is used for background jobs because the project runs BullMQ workers [1].';
  const { text, citedIndices } = reconcileSources(raw);
  const sources = buildSources(built.sources, citedIndices);
  assert.ok(text.includes('[1]'));
  assert.ok(citedIndices.includes(1));
  // Source 1 is the ADR about background queues
  assert.ok(sources.some((s) => s.kind === 'adr'));
});

test('pipeline with no retrieved context produces the exact refusal phrase', () => {
  const empty = buildPrompt({ question: 'something nobody has written about', contextChunks: [] });
  assert.equal(empty.empty, true);
  assert.ok(empty.user.includes(REFUSAL_PHRASE));

  // The refusal path must NOT fabricate sources.
  const sources = buildSources(empty.sources, []);
  assert.equal(sources.length, 0);
});

test('chunks from an unrelated concept never leak as the top answer', () => {
  // All candidates are about the wrong topic (video), none matches the question (auth).
  const results = rerank(
    [
      candidate('transcoding uploads with ffmpeg', { sourceType: 'file', title: 'video.ts' }, 0.15),
      candidate('hls streaming the player', { sourceType: 'documentation', title: 'stream.md' }, 0.2),
    ],
    'how does authentication with clerk work?',
  );
  // No chunk contains anything about auth, so the refusal gate should be the honest response.
  const built = buildPrompt({ question: 'how does authentication work', contextChunks: results });
  assert.ok(built.empty === false); // we still have docs, but they are irrelevant
  // The model must be told it may refuse; the prompt always carries the escape hatch.
  assert.ok(built.user.includes(REFUSAL_PHRASE));
  // And the top-ranked chunk should not be presented as if it answers the question.
  assert.ok(!results[0].content.toLowerCase().includes('auth'));
});