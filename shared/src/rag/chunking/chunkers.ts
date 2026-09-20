import type { DocMetadata } from '../types';

/**
 * Chunking strategies for the RAG knowledge base.
 *
 * Chunking matters: a chunk should be internally coherent (one idea / one section /
 * one unit of code) and small enough to embed and attend to, while retaining enough
 * context to be useful. We chunk structurally rather than by fixed token counts so a
 * later metadata filter (ADR id, PR number, component path) still points at the right
 * chunk.
 */

export interface Chunk {
  content: string;
  /** Section/heading/path the chunk came from, kept in metadata. */
  section?: string;
}

const EMPTY = /^\s*$/;

/**
 * Split long text into roughly-sized plain chunks with overlap so noun phrases that
 * cross a boundary are not torn. Deterministic, byte-based (not token-based) to stay
 * dependency-free and testable.
 */
export function splitBySize(text: string, chunkSize = 1800, overlap = 150): string[] {
  const cleaned = text.trim();
  if (!cleaned) return [];
  if (cleaned.length <= chunkSize) return [cleaned];

  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    let end = Math.min(start + chunkSize, cleaned.length);

    // Try to break on a paragraph / newline boundary near the target end.
    if (end < cleaned.length) {
      const window = cleaned.slice(Math.max(start, end - 300), end + 120);
      const lastPara = window.lastIndexOf('\n\n');
      if (lastPara > 40) {
        end = Math.max(start, Math.max(start, end - 300) + lastPara);
      } else {
        const lastLine = window.lastIndexOf('\n');
        if (lastLine > 40) {
          end = Math.max(start, Math.max(start, end - 300) + lastLine);
        }
      }
    }

    chunks.push(cleaned.slice(start, end).trim());
    start = Math.max(start + 1, end - overlap);
  }
  return chunks.filter((c) => !EMPTY.test(c));
}

/**
 * Chunk a markdown document on its headings, splitting oversized sections further by
 * size. Each ATX heading opens a new section; the section's title is the heading text.
 */
export function chunkMarkdown(markdown: string, chunkSize = 1800, overlap = 150): Chunk[] {
  const lines = markdown.split('\n');
  const out: Chunk[] = [];
  let current: string[] = [];
  let currentHeading = '';

  const flush = () => {
    const body = current.join('\n').trim();
    if (EMPTY.test(body)) return;
    for (const piece of splitBySize(body, chunkSize, overlap)) {
      out.push({ content: piece, section: currentHeading });
    }
    current = [];
  };

  for (const line of lines) {
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      currentHeading = h[2].trim();
      current = [];
      continue;
    }
    // Skip pure separators so an empty section between headings doesn't split a body.
    current.push(line);
  }
  flush();
  return out;
}

/** Chunk a single code file: one chunk per top-level declaration where feasible. */
export function chunkCodeFile(content: string, maxChunkSize = 2500): Chunk[] {
  const cleaned = content.trim();
  if (!cleaned) return [];
  if (cleaned.length <= maxChunkSize) return [{ content: cleaned }];

  const lines = cleaned.split('\n');
  const out: Chunk[] = [];
  let start = 0;
  const declRe = /^(?:export\s+)?(?:async\s+)?(?:function|class|const\s+\w+\s*=\s*(?:async\s*)?\()/;

  for (let i = 0; i < lines.length; i++) {
    const hitsDecl = declRe.test(lines[i]);
    const tooLarge = lines[i].length + (start === 0 ? 0 : 0) > maxChunkSize;
    if (hitsDecl && i - start >= 3 && (i - start) > 6) {
      out.push({ content: lines.slice(start, i).join('\n').trim(), section: lines[start]?.trim() });
      start = i;
    } else if (tooLarge && i > start) {
      out.push({ content: lines.slice(start, i).join('\n').trim() });
      start = i;
    }
  }
  out.push({ content: lines.slice(start).join('\n').trim(), section: lines[start]?.trim() });
  return out.filter((c) => !EMPTY.test(c.content));
}

/** Make a content string ready for embedding / metadata storage. */
export function truncate(text: string, max = 6000): string {
  return text.length <= max ? text : `${text.slice(0, max)}\n… [truncated]`;
}

/**
 * Build a full `Document` insert candidate from raw source content + its metadata.
 */
export function toChunksWithMeta(
  base: Pick<DocMetadata, 'sourceType' | 'title' | 'repositoryId' | 'repoFullName'> &
    Partial<DocMetadata>,
  rawContent: string,
  chunkSize?: number,
): { content: string; section?: string; metadata: DocMetadata }[] {
  const strategy = base.sourceType === 'code_chunk' || base.sourceType === 'file'
    ? chunkCodeFile(rawContent)
    : chunkMarkdown(rawContent, chunkSize);

  return strategy.map((c) => ({
    content: truncate(c.content),
    section: c.section,
    metadata: {
      ...base,
      title: c.section ? `${base.title} — ${c.section}` : base.title,
      section: c.section,
    } as DocMetadata,
  }));
}