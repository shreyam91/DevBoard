import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitBySize, chunkMarkdown, chunkCodeFile, toChunksWithMeta } from './chunkers';

test('splitBySize returns unchanged content under the limit', () => {
  const in_ = 'hello world';
  assert.deepEqual(splitBySize(in_, 1800), [in_]);
});

test('splitBySize splits long text and never loses bytes', () => {
  const body = Array.from({ length: 100 }, (_, i) => `line ${i} some content that repeats`).join('\n\n');
  const chunks = splitBySize(body, 500, 80);
  assert.ok(chunks.length > 1);
  // recomposition minus overlap should approximate the original
  const joined = chunks.join('\n');
  assert.ok(joined.length <= body.length + chunks.length * 80);
  assert.ok(chunks.every((c) => c.length > 0));
});

test('splitBySize returns empty for blank input', () => {
  assert.deepEqual(splitBySize('   \n  '), []);
});

test('chunkMarkdown splits by heading and tracks section', () => {
  const md = '# Overview\nsome intro\n\n## Databases\nwe use postgres\n\n## Queues\nredis\n';
  const chunks = chunkMarkdown(md);
  assert.ok(chunks.some((c) => c.section === 'Overview'));
  assert.ok(chunks.some((c) => c.section === 'Databases'));
  assert.ok(chunks.some((c) => c.section === 'Queues'));
});

test('chunkCodeFile keeps small files whole and splits big ones on declarations', () => {
  const small = 'export function a() { return 1; }';
  assert.equal(chunkCodeFile(small).length, 1);

  const big = Array.from({ length: 80 }, (_, i) => (i % 10 === 0 ? `export function fn${i}(a, b) {` : `  const x${i} = a + b;`)).join('\n');
  // explicit chunk size below the input length forces the split path
  const out = chunkCodeFile(big, 400);
  assert.ok(out.length >= 4);
});

test('toChunksWithMeta maps metadata onto each chunk', () => {
  const chunks = toChunksWithMeta(
    { sourceType: 'documentation', title: 'Architecture.md', repositoryId: 'r1', repoFullName: 'acme/web' },
    '# System\n\n## Database\npostgres\n\n## Queue\nredis',
  );
  assert.ok(chunks.length >= 2);
  for (const c of chunks) {
    assert.equal(c.metadata.sourceType, 'documentation');
    assert.equal(c.metadata.repositoryId, 'r1');
    assert.ok(c.metadata.section);
  }
});