import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPrompt,
  REFUSAL_PHRASE,
  reconcileSources,
  buildSources,
  citationFor,
} from './buildPrompt';
import type { RerankedChunk, DocMetadata, Citation } from '../types';

function chunk(content: string, meta: Partial<DocMetadata>, score = 0.9): RerankedChunk {
  return {
    docId: 'd1', repoId: 'r1', title: meta.title ?? 't', content,
    metadata: meta as DocMetadata, distance: 0.1, score,
  };
}

test('buildPrompt with empty context forces the refusal phrase', () => {
  const p = buildPrompt({ question: 'anything', contextChunks: [] });
  assert.equal(p.empty, true);
  assert.ok(p.user.includes(REFUSAL_PHRASE));
});

test('buildPrompt embeds sources with numbered tags and grounding instruction', () => {
  const chunks = [chunk('Redis is used for background jobs', { sourceType: 'adr', title: 'ADR Background jobs' })];
  const p = buildPrompt({ question: 'Why redis', contextChunks: chunks });
  assert.equal(p.empty, false);
  assert.ok(p.user.includes('<source nr="1" type="adr"'));
  assert.ok(p.user.includes(REFUSAL_PHRASE)); // refusal escape hatch always present
  assert.ok(p.system.includes('reply with exactly'));
});

test('buildPrompt includes recent history', () => {
  const p = buildPrompt({
    question: 'what changed',
    contextChunks: [chunk('a changed', { sourceType: 'architecture' })],
    history: [{ role: 'user', content: 'tell me about auth' }, { role: 'assistant', content: 'auth uses clerk' }],
  });
  assert.ok(p.user.includes('tell me about auth'));
  assert.ok(p.user.includes('auth uses clerk'));
});

test('reconcileSources normalizes run-on tags', () => {
  const { text, citedIndices } = reconcileSources('Users redis [1][3] and postgres [1, 2] here.');
  assert.equal(citedIndices.join(','), '1,2,3');
  assert.ok(!text.includes('[1, 2]'));
  assert.ok(text.includes('[1][2]'));
});

test('buildSources returns only cited sources with matching order', () => {
  const sources: Citation[] = [
    { kind: 'adr', title: 'A', href: '/a', detail: 'a' },
    { kind: 'file', title: 'B', href: '/b', detail: 'b' },
    { kind: 'pr', title: 'C', href: '/c', detail: 'c' },
  ];
  const cited = buildSources(sources, [1, 3]);
  assert.equal(cited.length, 2);
  assert.equal(cited[0].title, 'A');
  assert.equal(cited[1].title, 'C');
});

test('citationFor builds github links for PR and file', () => {
  const pr = citationFor({ sourceType: 'pr', prNumber: 42, repoFullName: 'acme/web' }, 'x');
  assert.equal(pr.href, 'https://github.com/acme/web/pull/42');
  assert.equal(pr.kind, 'pr');

  const file = citationFor({ sourceType: 'file', filePath: 'src/main.ts', repoFullName: 'acme/web' }, 'x');
  assert.equal(file.href, 'https://github.com/acme/web/blob/HEAD/src/main.ts');
});