import { test } from 'node:test';
import assert from 'node:assert';
import { extractIssueReferences, resolveIssues } from './issues';

test('extracts bare #N references from title and description', () => {
  const refs = extractIssueReferences('Fix #1046', 'See #1046 for details.\nAlso #12.', []);
  const numbers = refs.map((r) => r.number);
  assert.ok(numbers.includes(1046));
  assert.ok(numbers.includes(12));
});

test('extracts keyword-anchored references (Fixes/Closes/Resolves/Issue)', () => {
  const refs = extractIssueReferences(
    'Fix payment timeout',
    'Resolves #1046. Closes #1047. Issue #1048. Fixes #1049.',
    []
  );
  assert.deepEqual(
    refs.map((r) => r.number).sort(),
    [1046, 1047, 1048, 1049]
  );
  assert.ok(refs.every((r) => r.keyword !== null));
});

test('extracts references from commit messages', () => {
  const refs = extractIssueReferences('Title', '', ['fixes #77', '#88']);
  assert.deepEqual(refs.map((r) => r.number).sort(), [77, 88]);
  assert.ok(refs.find((r) => r.number === 77)?.source === 'commit');
});

test('de-duplicates the same number across sources, preferring keyword-anchored', () => {
  const refs = extractIssueReferences('#12', '', ['#12']);
  assert.strictEqual(refs.length, 1);
  assert.strictEqual(refs[0].number, 12);
  assert.strictEqual(refs[0].keyword, null);

  const withKeyword = extractIssueReferences('#12', 'Fixes #12', []);
  assert.strictEqual(withKeyword.length, 1);
  assert.notStrictEqual(withKeyword[0].keyword, null);
});

test('returns empty for text with no references', () => {
  assert.deepEqual(extractIssueReferences('No refs here', 'plain text', []), []);
});

test('resolveIssues ignores non-404-absent, non-issue numbers and PRs', async () => {
  const fakeFetch: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes('/issues/1')) {
      return new Response(JSON.stringify({ number: 1, title: 'A bug', body: 'Body', state: 'open', html_url: 'https://github.com/o/r/issues/1' }), { status: 200 });
    }
    if (url.includes('/issues/2')) {
      // It's actually a PR.
      return new Response(JSON.stringify({ number: 2, title: 'PR', body: null, state: 'open', html_url: 'https://github.com/o/r/pull/2' }), { status: 200 });
    }
    return new Response(JSON.stringify({}), { status: 404, statusText: 'Not Found' });
  };

  const resolved = await resolveIssues('o/r', [
    { number: 1, keyword: null, source: 'description' },
    { number: 2, keyword: null, source: 'description' },
    { number: 999, keyword: null, source: 'description' },
  ], 'token', fakeFetch);

  assert.strictEqual(resolved.length, 1);
  assert.strictEqual(resolved[0].number, 1);
  assert.strictEqual(resolved[0].title, 'A bug');
});

test('resolveIssues swallows network errors (best-effort)', async () => {
  const brokenFetch: typeof fetch = async () => { throw new Error('boom'); };
  const resolved = await resolveIssues('o/r', [{ number: 1, keyword: null, source: 'title' }], 'token', brokenFetch);
  assert.deepEqual(resolved, []);
});