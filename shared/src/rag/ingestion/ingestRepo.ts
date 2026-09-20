/**
 * RAG ingestion for a single repository.
 *
 * This is the write-path for the project knowledge base. For each repository it:
 *   1. Fetches ADRs (decisions), ARCHITECTURE.md, PRs, issues, commits, and file structure via GitHub API.
 *   2. Chunks them structurally (markdown headings for docs, declaration-based for code).
 *   3. Generates embeddings for each chunk.
 *   4. Upserts `Document` rows into Postgres, including the embedding vector.
 *
 * Repository isolation is maintained because every document gets `metadata.repositoryId = repoId`
 * and the `repo_id` column is set to the exact same repo. The retrieval module enforces this at
 * query time via `WHERE repo_id = $X`.
 *
 * This function is idempotent: re-running for a repo de-duplicates by (repo_id, sourceType, title, section).
 * Prisma raw SQL is used for embedding inserts because the `embedding` column is typed as
 * `Unsupported("vector")`.
 */

import { prisma } from '../../prisma';
import { getGithubToken } from '../../utils/auth';
import crypto from 'crypto';
import { chunkMarkdown, chunkCodeFile, truncate } from '../chunking/chunkers';
import { embedBatch } from '../embeddings/embed';
import type { DocMetadata, SourceType } from '../types';

const log = (msg: string) => console.log(`[rag-ingest] ${msg}`);
const warn = (msg: string) => console.warn(`[rag-ingest] ${msg}`);

// ---- helpers ------------------------------------------------------------------

async function gh<T = any>(url: string, token: string): Promise<T | null> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
  });
  if (res.status === 404) return null;
  if (!res.ok) { warn(`GitHub ${url} failed: ${res.status}`); return null; }
  return res.json() as Promise<T>;
}

function dedupKey(repoId: string, sourceType: SourceType, title: string, section?: string) {
  return `${repoId}:${sourceType}:${title}:${section ?? ''}`;
}

// ---- main entry ---------------------------------------------------------------

export interface IngestionResult {
  docCount: number;
  sourceTypes: SourceType[];
  /** A small subset of titles so the caller / UI can show what was indexed. */
  highlights: string[];
}

/**
 * Ingest everything we can from the repository and store it as Document rows.
 */
export async function ingestRepo(repoId: string, repoFullName: string): Promise<IngestionResult> {
  log(`Starting ingestion for ${repoFullName}`);

  const repo = await prisma.repo.findUnique({ where: { id: repoId } });
  if (!repo) throw new Error(`Repo not found: ${repoId}`);

  const token = await getGithubToken(repo.user_id);
  if (!token) throw new Error(`No GitHub token for repo ${repoId}`);

  const batch: { content: string; metadata: DocMetadata }[] = [];

  // 1. ARCHITECTURE.md
  try {
    const arch = await gh<{ content?: string; download_url?: string }>(
      `https://api.github.com/repos/${repoFullName}/contents/ARCHITECTURE.md`,
      token,
    );
    if (arch?.content) {
      const md = Buffer.from(arch.content, 'base64').toString('utf-8');
      batch.push(...chunkMarkdown(md).map((c) => ({
        content: truncate(c.content),
        metadata: {
          repositoryId: repoId,
          sourceType: 'architecture' as SourceType,
          title: 'ARCHITECTURE.md',
          section: c.section,
          path: 'ARCHITECTURE.md',
          filePath: 'ARCHITECTURE.md',
          repoFullName,
          url: `https://github.com/${repoFullName}/blob/HEAD/ARCHITECTURE.md`,
        },
      })));
    }
  } catch { /* fine, file may not exist */ }

  // 2. Confirmed ADR decisions
  try {
    const decisions = await prisma.decision.findMany({
      where: { repo_id: repoId, confirmed_by_user: true },
      select: { id: true, title: true, rationale: true, category: true, pr_number: true },
    });
    for (const d of decisions) {
      const md = `# ${d.title}\n\nCategory: ${d.category}\n\n${d.rationale}`;
      batch.push(...chunkMarkdown(md).map((c) => ({
        content: truncate(c.content),
        metadata: {
          repositoryId: repoId,
          sourceType: 'adr' as SourceType,
          title: `ADR — ${d.title}`,
          adrId: d.id,
          section: c.section,
          filePath: d.pr_number ? undefined : undefined,
          prNumber: d.pr_number ?? undefined,
          repoFullName,
        },
      })));
    }
  } catch (e) { warn(`Failed to read decisions for ${repoId}: ${(e as Error).message}`); }

  // 3. Documents table — architecture versions
  try {
    const latest = await prisma.architectureVersion.findFirst({
      where: { repo_id: repoId },
      orderBy: { version: 'desc' },
    });
    if (latest) {
      batch.push(...chunkMarkdown(latest.content).map((c) => ({
        content: truncate(c.content),
        metadata: {
          repositoryId: repoId,
          sourceType: 'architecture' as SourceType,
          title: `Architecture v${latest.version}`,
          section: c.section,
          path: 'ARCHITECTURE.md',
          filePath: 'ARCHITECTURE.md',
          repoFullName,
          url: `https://github.com/${repoFullName}/blob/HEAD/ARCHITECTURE.md`,
        },
      })));
    }
  } catch { /* ok */ }

  // 4. Pull Requests (recent)
  try {
    const prs = await gh<{ number: number; title: string; body?: string | null }[]>(
      `https://api.github.com/repos/${repoFullName}/pulls?state=all&per_page=30`,
      token,
    );
    if (prs) for (const pr of prs) {
      const body = pr.body?.trim() || '';
      if (!body) continue;
      batch.push({
        content: truncate(`# PR #${pr.number}: ${pr.title}\n\n${body}`),
        metadata: {
          repositoryId: repoId,
          sourceType: 'pr' as SourceType,
          title: `PR #${pr.number} — ${pr.title}`,
          prNumber: pr.number,
          repoFullName,
          url: `https://github.com/${repoFullName}/pull/${pr.number}`,
        },
      });
    }
  } catch (e) { warn(`Failed to read PRs: ${(e as Error).message}`); }

  // 5. Issues (recent)
  try {
    const issues = await gh<{ number: number; title: string; body?: string | null }[]>(
      `https://api.github.com/repos/${repoFullName}/issues?state=all&per_page=30`,
      token,
    );
    if (issues) for (const i of issues) {
      if (i.body?.trim()) {
        batch.push({
          content: truncate(`# Issue #${i.number}: ${i.title}\n\n${i.body}`),
          metadata: {
            repositoryId: repoId,
            sourceType: 'issue' as SourceType,
            title: `Issue #${i.number} — ${i.title}`,
            issueNumber: i.number,
            repoFullName,
            url: `https://github.com/${repoFullName}/issues/${i.number}`,
          },
        });
      }
    }
  } catch (e) { warn(`Failed to read issues: ${(e as Error).message}`); }

  // 6. Recent commits
  try {
    const commits = await gh<{ sha: string; commit: { message: string; author?: { name?: string } | null } }[]>(
      `https://api.github.com/repos/${repoFullName}/commits?per_page=25`,
      token,
    );
    if (commits) for (const c of commits) {
      batch.push({
        content: truncate(`Commit ${c.sha.slice(0, 7)}: ${c.commit.message}\n\nAuthor: ${c.commit.author?.name ?? 'unknown'}`),
        metadata: {
          repositoryId: repoId,
          sourceType: 'commit' as SourceType,
          title: `Commit ${c.sha.slice(0, 7)}`,
          repoFullName,
          url: `https://github.com/${repoFullName}/commit/${c.sha}`,
        },
      });
    }
  } catch (e) { warn(`Failed to read commits: ${(e as Error).message}`); }

  // 7. Key source files (services, index, config)
  const keyPaths = [
    'package.json', 'tsconfig.json', 'docker-compose.yml', 'Dockerfile',
    'prisma/schema.prisma', 'src/index.ts', 'src/app/page.tsx',
    'src/workers/index.ts', 'src/workers/reviewWorker.ts',
    'src/review/engine.ts', 'src/llm/client.ts', 'src/queue.ts', 'src/prisma.ts',
  ];
  try {
    for (const p of keyPaths) {
      const f = await gh<{ content?: string }>(
        `https://api.github.com/repos/${repoFullName}/contents/${p}`,
        token,
      );
      if (f?.content) {
        const text = Buffer.from(f.content, 'base64').toString('utf-8');
        const isTs = /\.(ts|tsx|js|jsx)$/.test(p);
        const chunks = isTs ? chunkCodeFile(text) : chunkMarkdown(text);
        for (const c of chunks) {
          batch.push({
            content: truncate(c.content),
            metadata: {
              repositoryId: repoId,
              sourceType: isTs ? 'code_chunk' as SourceType : 'file' as SourceType,
              title: p,
              section: c.section,
              path: p,
              filePath: p,
              repoFullName,
              url: `https://github.com/${repoFullName}/blob/HEAD/${p}`,
            },
          });
        }
      }
    }
  } catch (e) { warn(`Failed to read source files: ${(e as Error).message}`); }

  // 8. README
  try {
    const readme = await gh<{ content?: string }>(
      `https://api.github.com/repos/${repoFullName}/contents/README.md`,
      token,
    );
    if (readme?.content) {
      const md = Buffer.from(readme.content, 'base64').toString('utf-8');
      batch.push(...chunkMarkdown(md).map((c) => ({
        content: truncate(c.content),
        metadata: {
          repositoryId: repoId,
          sourceType: 'repository' as SourceType,
          title: 'README.md',
          section: c.section,
          filePath: 'README.md',
          path: 'README.md',
          repoFullName,
          url: `https://github.com/${repoFullName}/blob/HEAD/README.md`,
        },
      })));
    }
  } catch { /* ok */ }

  log(`Collected ${batch.length} chunks — generating embeddings…`);

  // Generate embeddings in batches and persist to Document table.
  const BATCH = 64;
  let docCount = 0;
  const sourceTypes = new Set<SourceType>();
  const titles = new Set<string>();

  for (let i = 0; i < batch.length; i += BATCH) {
    const slice = batch.slice(i, i + BATCH);
    const texts = slice.map((b) => `${b.metadata.title ?? ''}\n${b.content}`);
    const vectors = await embedBatch(texts);

    for (let j = 0; j < slice.length; j++) {
      const { content, metadata } = slice[j];
      const vector = vectors[j];
      const vectorStr = `[${vector.join(',')}]`;

      // De-duplicate: check for existing doc with same (repo_id, sourceType, title, section)
      try {
        const existing = await prisma.$queryRaw<{ id: string }[]>(
          `SELECT id FROM documents
           WHERE repo_id = $1
             AND (metadata->>'sourceType')::text = $2
             AND title = $3
             AND COALESCE((metadata->>'section')::text, '') = COALESCE($4, '')
           LIMIT 1`,
          repoId,
          metadata.sourceType,
          metadata.title,
          metadata.section ?? '',
        );

        if (existing.length > 0) {
          // Update content, embedding, metadata
          await prisma.$executeRaw`
            UPDATE documents
            SET content = ${content}, embedding = ${vectorStr}::vector, metadata = ${JSON.stringify(metadata)}::jsonb, updated_at = NOW()
            WHERE id = ${existing[0].id}
          `;
        } else {
          await prisma.$executeRaw`
            INSERT INTO documents (id, repo_id, type, title, content, path, url, metadata, embedding, created_at, updated_at)
            VALUES (
              ${crypto.randomUUID()},
              ${repoId},
              ${metadata.sourceType},
              ${metadata.title ?? 'Untitled'},
              ${content},
              ${metadata.path ?? null},
              ${metadata.url ?? null},
              ${JSON.stringify(metadata)}::jsonb,
              ${vectorStr}::vector,
              NOW(),
              NOW()
            )
          `;
        }
      } catch (e) {
        warn(`DB upsert failed for "${metadata.title}": ${(e as Error).message}`);
      }
      sourceTypes.add(metadata.sourceType);
      if (metadata.title) titles.add(metadata.title);
      docCount++;
    }
  }

  const highlights = [...titles].slice(0, 12);
  log(`Ingestion complete: ${docCount} documents indexed from ${sourceTypes.size} source types`);
  return { docCount, sourceTypes: [...sourceTypes], highlights };
}