import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractMetadataFilters, contextToFilter } from './filters';

test('extractMetadataFilters detects PR number', () => {
  const f = extractMetadataFilters('Which PR introduced this retry mechanism? PR #42');
  assert.ok(f.some((x) => x.sourceType === 'pr' && x.prNumber === 42));
});

test('extractMetadataFilters detects ADR', () => {
  const f = extractMetadataFilters('Which ADR applies to this service? ADR-014');
  assert.ok(f.some((x) => x.sourceType === 'adr'));
});

test('extractMetadataFilters detects file path', () => {
  const f = extractMetadataFilters('Explain the file backend/src/workers/index.ts');
  assert.ok(f.some((x) => x.filePathPrefix?.startsWith('backend/src/workers/index')));
});

test('extractMetadataFilters detects issue', () => {
  const f = extractMetadataFilters('issue #101 is about the login bug');
  assert.ok(f.some((x) => x.sourceType === 'issue' && x.issueNumber === 101));
});

test('extractMetadataFilters returns empty for generic question', () => {
  const f = extractMetadataFilters('How does this project work?');
  assert.equal(f.length, 0);
});

test('contextToFilter returns prNumber for PR context', () => {
  assert.deepEqual(contextToFilter({ prNumber: 42 }), { sourceType: 'pr', prNumber: 42 });
});

test('contextToFilter returns null for empty context', () => {
  assert.equal(contextToFilter({}), null);
});