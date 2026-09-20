import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRetrievalQuery } from './query';

// Deterministic 2-dim mock embeddings would break the contract (we always build
// vector(1536)), but the SQL/param composition is what we test here, so a short
// array is fine for assertion purposes.
const embedding = [0.1, 0.2];

test('RETRIEVAL ISOLATION: query for repo A is always scoped to repo A', () => {
  const { sql, params } = buildRetrievalQuery('repoA', [], 10, embedding);
  // the repo_id clause must be the first WHERE condition and $1 must be repoA
  const whereIdx = sql.indexOf('WHERE d.repo_id = $1');
  assert.ok(whereIdx > -1, 'repo_id filter must be present');
  assert.equal(params[0], 'repoA', 'first positional param must be the scoped repoId');
});

test('a different repo produces a query scoped to that different repo', () => {
  const a = buildRetrievalQuery('AAA', [], 10, embedding);
  const b = buildRetrievalQuery('BBB', [], 10, embedding);
  assert.equal(a.params[0], 'AAA');
  assert.equal(b.params[0], 'BBB');
  assert.notEqual(a.params[0], b.params[0]);
});

test('retrieval cannot be called with the embedding as $1 (params order enforced)', () => {
  const { params } = buildRetrievalQuery('repoX', [], 10, embedding);
  assert.ok(String(params[0]).startsWith('repo'), 'param[0] is repoId, not the embedding');
  assert.ok(String(params[1]).startsWith('['), 'param[1] is the vector literal');
});

test('metadata filters are AND-composed into the clause and reflect filters', () => {
  const { sql, params } = buildRetrievalQuery('repoA', [
    { sourceType: 'adr' },
    { prNumber: 42 },
  ], 10, embedding);
  assert.ok(sql.includes("(m->>'sourceType')::text = $3"));
  assert.ok(sql.includes("(m->>'prNumber')::int = $4"));
  // $1=repoId, $2=embedding, $3.. = filters, final = limit
  assert.equal(params[2], 'adr');
  assert.equal(params[3], 42);
  assert.equal(params[4], 10);
});

test('filePathPrefix becomes an ILIKE with a % wildcard', () => {
  const { sql, params } = buildRetrievalQuery('repoA', [{ filePathPrefix: 'backend/src/payment' }], 10, embedding);
  assert.ok(sql.includes('ILIKE'));
  assert.equal(params[2], 'backend/src/payment%');
});

test('limit is placed last and bounds the result set', () => {
  const { sql, params } = buildRetrievalQuery('repoA', [{ sourceType: 'pr' }], 25, embedding);
  assert.ok(sql.trimEnd().endsWith(`LIMIT $4;`));
  assert.equal(params[3], 25);
});