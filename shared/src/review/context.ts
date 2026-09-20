import { prisma } from '../prisma';
import type { PRMetadata, CommitSummary } from './github';
import type { ResolvedIssue } from './issues';
import type { DiffChunk } from './diff';

/** Everything the reviewer knows about the change before it reasons. */
export interface ReviewContext {
  repoId: string;
  repoFullName: string;
  pr: PRMetadata;
  commits: CommitSummary[];
  resolvedIssues: ResolvedIssue[];
  changedFiles: string[];
  chunks: DiffChunk[];
  /** Latest committed architecture document content, if any. */
  architectureContent: string | null;
  /** Confirmed architectural decisions for the repo. */
  decisions: { id: string; title: string; rationale: string; category: string }[];
}

/**
 * Load repository context (architecture document + confirmed decisions) from
 * the database. Best-effort: never throws on a missing architecture.
 */
export async function loadRepoContext(repoId: string): Promise<{
  architectureContent: string | null;
  decisions: { id: string; title: string; rationale: string; category: string }[];
}> {
  let architectureContent: string | null = null;
  try {
    const arch = await prisma.architectureVersion.findFirst({
      where: { repo_id: repoId },
      orderBy: { version: 'desc' },
    });
    architectureContent = arch ? arch.content.slice(0, 8000) : null;
  } catch (e) {
    console.warn(`[review] failed to load architecture for ${repoId}: ${(e as Error).message}`);
  }

  let decisions: { id: string; title: string; rationale: string; category: string }[] = [];
  try {
    decisions = await prisma.decision.findMany({
      where: { repo_id: repoId, confirmed_by_user: true },
      select: { id: true, title: true, rationale: true, category: true },
      take: 50,
    });
  } catch (e) {
    console.warn(`[review] failed to load decisions for ${repoId}: ${(e as Error).message}`);
  }

  return { architectureContent, decisions };
}

/** Build a single human/scoped context for the engine from its parts. */
export function assembleContext(input: Omit<ReviewContext, 'architectureContent' | 'decisions'> & {
  architectureContent: string | null;
  decisions: ReviewContext['decisions'];
}): ReviewContext {
  return { ...input };
}