import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rerank, tokenOverlap, jaccard, hybridScore, WEIGHTS } from './rerank';
import type { RetrievedChunk, DocMetadata, SourceType } from '../types';

function chunk(id: string, content: string, meta: Partial<DocMetadata>, distance = 0.2): RetrievedChunk {
  return { docId: id, repoId: 'r1', title: id, content, metadata: meta as DocMetadata, distance };
}

test('rerank prefers smaller cosine distance when lexical/metadata are tied', () => {
  const near = chunk('a', 'we use redis for background job processing', { sourceType: 'adr' }, 0.05);
  const far = chunk('b', 'the frontend renders with next.js and react', { sourceType: 'architecture' }, 0.6);
  const out = rerank([far, near], 'why did we choose redis');
  assert.equal(out[0].docId, 'a');
});

test('rerank boosts an exact token match over a closer vector neighbour (never similarity alone)', () => {
  // Both chunks have IDENTICAL vector distance, but only the exact match carries the
  // target component name in its metadata and content — proving reranking is not a
  // pure vector sort.
  const exact = chunk('a', 'PaymentService uses stripe and handles refunds', { filePath: 'backend/src/payment/PaymentService.ts', sourceType: 'code_chunk' }, 0.3);
  const generic = chunk('b', 'the payment domain handles billing for subscribers', { sourceType: 'adr' }, 0.3);
  const out = rerank([generic, exact], 'What should I understand before modifying PaymentService?');
  assert.equal(out[0].docId, 'a');
});

test('rerank honours metadata PR filter by upweighting the matching PR chunk', () => {
  const matchesPr = chunk('a', 'added a retry mechanism with exponential backoff', { sourceType: 'pr', prNumber: 42 }, 0.3);
  const other = chunk('b', 'added a retry mechanism with exponential backoff', { sourceType: 'adr' }, 0.3);
  const out = rerank([other, matchesPr], 'which PR added retries PR #42', [{ prNumber: 42 }]);
  assert.equal(out[0].docId, 'a');
});

test('rerank dedupes by docId', () => {
  const a = chunk('a', 'redis is used for queues', { sourceType: 'adr' }, 0.1);
  const dup = chunk('a', 'redis is used for queues', { sourceType: 'adr' }, 0.15);
  const out = rerank([a, dup], 'redis');
  assert.equal(out.filter((c) => c.docId === 'a').length, 1);
});

test('scores are within [0, 1] and weighted correctly', () => {
  const s = hybridScore({ semantic: 0.9, lexical: 0.8, metadata: 0.7 });
  assert.ok(s <= 0.9);
  assert.ok(Math.abs(s - (0.9 * WEIGHTS.semantic + 0.8 * WEIGHTS.lexical + 0.7 * WEIGHTS.metadata)) < 1e-9);
});

test('tokenOverlap counts shared normalized tokens', () => {
  assert.ok(tokenOverlap('Redis queues', 'REDIS QUEUES and workers') >= 2);
  assert.equal(tokenOverlap('aaa', 'ccc ddd'), 0);
});

test('jaccard returns 0 for disjoint sets', () => {
  assert.equal(jaccard('aaaa bbbb', 'cccc dddd'), 0);
});