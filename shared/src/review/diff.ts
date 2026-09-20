import parseDiff from 'parse-diff';

/**
 * Robust diff processing.
 *
 * - Classifies files (ignores generated/lockfiles, prioritizes source).
 * - Preserves file paths, line numbers, and added/deleted lines.
 * - Chunks large diffs so the LLM never silently loses a change.
 * - Always records the full set of changed files and added lines, even when the
 *   textual context of an oversized file is trimmed.
 */

/** Names/patterns we treat as generated or irrelevant for review. */
const GENERATED_PATTERNS: RegExp[] = [
  /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb|go\.sum|Cargo\.lock|poetry\.lock|Gemfile\.lock|composer\.lock|Pipfile\.lock|flask\.lock)$/,
  /(^|\/)node_modules\//,
  /(^|\/)(dist|build|out|\.next|\.turbo|coverage|vendor)\//,
  /(\.min\.(js|css)|\.map)$/i,
  /(^|\/)(package-lock|yarn-lock)/,
  /(^|\/)\.env(\..*)?$/,
  /\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot|pdf|zip|gz|tar)$/i,
  /(^|\/)prisma\/migrations\//,
];

/** Source code extensions we want to prioritize for review. */
const SOURCE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'py', 'rb', 'go', 'rs', 'java',
  'kt', 'swift', 'php', 'cs', 'cpp', 'c', 'h', 'hpp', 'cc', 'sh', 'sql',
  'graphql', 'prisma', 'json', 'yml', 'yaml', 'toml', 'vue', 'svelte', 'ex', 'exs',
]);

const TEXT_EXTENSIONS_PRIORITY = 0.5;

export interface DiffFileInfo {
  path: string;
  additions: number;
  deletions: number;
  important: boolean;
  new: boolean;
  deleted: boolean;
  /** Compact rendered text, with line-numbered added/deleted lines. */
  text: string;
  /** All new-file line numbers that were added in this file. */
  addedLines: number[];
  /** True when the rendered text was capped and hunks were trimmed. */
  truncated: boolean;
}

export interface DiffChunk {
  index: number;
  files: DiffFileInfo[];
}

export interface ProcessedDiff {
  /** Every changed file, regardless of importance. */
  changedFiles: string[];
  /** Important source files eligible for LLM analysis, chunked. */
  chunks: DiffChunk[];
  /** Total rendered character count. */
  totalChars: number;
}

export function isGenerated(path: string): boolean {
  return GENERATED_PATTERNS.some((rx) => rx.test(path));
}

export function fileImportant(path: string): boolean {
  if (isGenerated(path)) return false;
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  return SOURCE_EXTENSIONS.has(ext);
}

const MAX_FILE_CHARS = 12000;
const MAX_CHUNK_CHARS = 40000;

/** Priority used to keep related files together while respecting the char cap. */
function scorePath(path: string): number {
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  return SOURCE_EXTENSIONS.has(ext) ? SOURCE_EXTENSIONS.size - path.length : TEXT_EXTENSIONS_PRIORITY;
}

/**
 * Render one file to a compact, line-numbered text form.
 * Added lines carry their new-file line number (`87+ ...`); deleted lines carry
 * their old-file line number (`45- ...`). Context lines are dropped to save tokens.
 */
function renderFile(file: parseDiff.File): { text: string; addedLines: number[] } {
  const addedLines: number[] = [];
  const lines: string[] = [];

  for (const chunk of file.chunks) {
    lines.push(`@@ -${chunk.oldStart},${chunk.oldLines} +${chunk.newStart},${chunk.newLines} @@`);
    for (const change of chunk.changes) {
      if (change.type === 'add') {
        addedLines.push(change.ln);
        lines.push(`${change.ln}+ ${change.content.slice(1)}`);
      } else if (change.type === 'del') {
        lines.push(`${change.ln}- ${change.content.slice(1)}`);
      }
      // 'normal' context lines intentionally omitted
    }
  }

  return { text: lines.join('\n'), addedLines };
}

/** Trim a rendered file's text to the cap while preserving all added-line numbers. */
function capFileText(full: string, lineCount: number, addedLines: number[]): string {
  if (full.length <= MAX_FILE_CHARS) return full;
  // Keep the hunk headers (first ~2000 chars) and the tail; the addedLines set
  // is preserved in full regardless, so references are never lost.
  const head = full.slice(0, 2000);
  const tail = full.slice(full.length - (MAX_FILE_CHARS - 2000));
  return `${head}\n… [${lineCount} changed lines truncated] …\n${tail}`;
}

/**
 * Process a raw unified diff string into classified, chunked context.
 */
export function processDiff(rawDiff: string): ProcessedDiff {
  const parsed = parseDiff(rawDiff);
  const changedFiles: string[] = [];

  const importantFiles: DiffFileInfo[] = [];
  let totalChars = 0;

  for (const file of parsed) {
    const path = file.to || file.from || '';
    if (!path) continue;
    changedFiles.push(path);

    if (!fileImportant(path)) continue;

    const { text: fullText, addedLines } = renderFile(file);
    const text = capFileText(fullText, file.additions + file.deletions, addedLines);
    totalChars += text.length;

    importantFiles.push({
      path,
      additions: file.additions,
      deletions: file.deletions,
      important: true,
      new: file.new === true,
      deleted: file.deleted === true,
      text,
      addedLines,
      truncated: text.length <= MAX_FILE_CHARS,
    });
  }

  // Order important files: most-important (source, larger/more central) first,
  // then chunk them so each chunk stays under the size cap but stays stable.
  importantFiles.sort((a, b) => scorePath(b.path) - scorePath(a.path));

  const chunks: DiffChunk[] = [];
  let current: DiffFileInfo[] = [];
  let currentChars = 0;
  const push = () => {
    if (current.length === 0) return;
    chunks.push({ index: chunks.length, files: current });
    current = [];
    currentChars = 0;
  };

  for (const info of importantFiles) {
    // Oversized single file gets its own chunk.
    if (info.text.length > MAX_CHUNK_CHARS) {
      push();
      chunks.push({ index: chunks.length, files: [info] });
      continue;
    }
    if (currentChars + info.text.length > MAX_CHUNK_CHARS) push();
    current.push(info);
    currentChars += info.text.length;
  }
  push();

  return { changedFiles, chunks, totalChars };
}