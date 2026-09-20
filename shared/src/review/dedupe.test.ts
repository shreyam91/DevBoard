import { test } from 'node:test';
import assert from 'node:assert';
import { dedupKey, dedupeFindings, normalizeTitle } from './dedupe';
import type { Finding } from './types';

const f = (over: Partial<Finding> = {}): Finding => ({
  severity: 'medium',
  category: 'bug',
  title: 'Null dereference on user',
  description: 'A description that is definitely long enough to pass validation.',
  file: 'src/a.ts',
  line: 10,
  confidence: 0.9,
  ...over,
});

test('normalizeTitle lowercases and collapses whitespace', () => {
  assert.strictEqual(normalizeTitle('  Null   Dereference  On USER '), 'null dereference on user');
});

test('dedupKey is stable per file+line+title', () => {
  assert.strictEqual(dedupKey(f()), dedupKey(f()));
  assert.notStrictEqual(dedupKey(f({ line: 11 })), dedupKey(f({ line: 10 })));
  assert.notStrictEqual(dedupKey(f({ title: 'Other' })), dedupKey(f({ title: 'Null dereference on user' })));
});

test('dedupeFindings collapses exact duplicates', () => {
  const out = dedupeFindings([f(), f(), f({ title: 'A genuinely different finding' })]);
  assert.strictEqual(out.length, 2);
});

test('dedupeFindings keeps same title at different lines', () => {
  const a = f({ line: 10 });
  const b = f({ line: 11 });
  assert.strictEqual(dedupeFindings([a, b]).length, 2);
});

test('dedupeFindings collapses title-only duplicates when no location', () => {
  const a = f({ file: undefined, line: undefined });
  const b = f({ file: undefined, line: undefined });
  assert.strictEqual(dedupeFindings([a, b]).length, 1);
});