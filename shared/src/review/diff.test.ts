import { test } from 'node:test';
import assert from 'node:assert';
import { processDiff, isGenerated, fileImportant } from './diff';

const SAMPLE_DIFF = `diff --git a/src/payment/PaymentService.ts b/src/payment/PaymentService.ts
index 111..aaa 100644
--- a/src/payment/PaymentService.ts
+++ b/src/payment/PaymentService.ts
@@ -80,6 +80,10 @@ export class PaymentService {
   async pay(amount: number) {
     const idempotencyKey = this.newKey();
+    const before = await this.client.charge({ amount, idempotencyKey });
+    if (before.failed) {
+      throw new PaymentFailedError();
+    }
     this.emit('paid', amount);
   }
 }
diff --git a/package-lock.json b/package-lock.json
index 222..bbb 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,3 +1,5 @@
+  "dependencies": {
+    "left-pad": "^1.3.0"
+  }
`;

test('isGenerated detects lockfiles and generated dirs', () => {
  assert.strictEqual(isGenerated('package-lock.json'), true);
  assert.strictEqual(isGenerated('frontend/package-lock.json'), true);
  assert.strictEqual(isGenerated('yarn.lock'), true);
  assert.strictEqual(isGenerated('dist/bundle.js'), true);
  assert.strictEqual(isGenerated('node_modules/x/index.js'), true);
  assert.strictEqual(isGenerated('app.min.js'), true);
  assert.strictEqual(isGenerated('src/logic.ts'), false);
  assert.strictEqual(isGenerated('logo.png'), true);
});

test('fileImportant flags source, ignores generated', () => {
  assert.strictEqual(fileImportant('src/payment/PaymentService.ts'), true);
  assert.strictEqual(fileImportant('src/index.js'), true);
  assert.strictEqual(fileImportant('go.mod'), false);
  assert.strictEqual(fileImportant('package-lock.json'), false);
});

test('processDiff keeps source files and drops lockfiles from chunks', () => {
  const result = processDiff(SAMPLE_DIFF);
  assert.deepEqual(result.changedFiles, ['src/payment/PaymentService.ts', 'package-lock.json']);
  // Only the source file should be analyzed.
  assert.strictEqual(result.chunks.length, 1);
  assert.strictEqual(result.chunks[0].files[0].path, 'src/payment/PaymentService.ts');
  // Added line numbers preserved (new-file line numbers of the additions).
  const addedLines = result.chunks[0].files[0].addedLines;
  assert.ok(addedLines.includes(82));
  assert.ok(addedLines.includes(84));
  assert.ok(addedLines.includes(85));
});

test('processDiff handles a diff with zero source changes', () => {
  const onlyLock = 'diff --git a/package-lock.json b/package-lock.json\nindex 1..2 100644\n--- a/package-lock.json\n+++ b/package-lock.json\n@@ -1,2 +1,3 @@\n+  "a": 1\n';
  const result = processDiff(onlyLock);
  assert.strictEqual(result.chunks.length, 0);
  assert.deepEqual(result.changedFiles, ['package-lock.json']);
});

test('large diffs are chunked into multiple chunks under the cap', () => {
  // parse-diff only starts a new file after the previous hunk's old+new line
  // counts drain to 0, so each synthetic file includes real context lines
  // alongside its additions. Build 5 such files; each renders >the 12k
  // per-file cap, so together they exceed the 40k chunk cap -> multiple chunks.
  const mkFile = (name: string, C: number, N: number) => {
    const ctx = Array.from({ length: C }, (_, i) => `  const ctx${i} = 0;`);
    const adds = Array.from(
      { length: N },
      (_, i) => `+const v${i} = compute(${i}, '${'x'.repeat(25)}');`
    );
    return [
      `diff --git a/${name} b/${name}`,
      'index 111..aaa 100644',
      `--- a/${name}`,
      `+++ b/${name}`,
      `@@ -1,${C} +1,${C + N} @@`,
      ...ctx,
      ...adds,
    ].join('\n');
  };

  const diffs = ['src/a0.ts', 'src/a1.ts', 'src/a2.ts', 'src/a3.ts', 'src/a4.ts'].map(
    (name) => mkFile(name, 10, 700)
  );
  const result = processDiff(diffs.join('\n'));
  assert.ok(result.chunks.length > 1, `expected >1 chunks, got ${result.chunks.length}`);
  assert.ok(result.changedFiles.length >= 5);
});