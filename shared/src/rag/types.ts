/**
 * Shared types for the Ask DevHub RAG layer.
 *
 * A `Document` row in Postgres is the atomic unit of knowledge. Every row carries
 * structured `metadata` so retrieval can filter by source kind *before* relying on
 * vector similarity, and so every answer can cite a concrete, clickable artifact.
 */

/** Which kind of artifact a knowledge chunk came from. */
export type SourceType =
  | 'adr' // a confirmed architectural decision (Decision row -> ADR)
  | 'architecture' // ARCHITECTURE.md / architecture markdown
  | 'pr' // a pull request
  | 'issue' // a GitHub issue
  | 'commit' // a commit message + touch summary
  | 'file' // a source file in the repository
  | 'code_chunk' // a sub-chunk of a file that maps to a component / service
  | 'documentation' // docs / markdown other than ADR/architecture
  | 'repository'; // README / repository-level overview

/**
 * Stored on every `Document.metadata` row. This is what makes retrieval
 * metadata-aware and lets answers point at real artifacts (PRs, ADRs, files).
 */
export interface DocMetadata {
  repositoryId: string;
  sourceType: SourceType;
  /** Path within the repo for file/code_chunk/documentation/architecture sources. */
  filePath?: string;
  /** Path relative to repo root, used to build clickable GitHub links. */
  path?: string;
  prNumber?: number;
  issueNumber?: number;
  adrId?: string;
  /** e.g. 'architecture', 'adr', 'readme', 'guide', 'api' */
  documentType?: string;
  title?: string;
  /** Section/heading the chunk came from (for documentation sources). */
  section?: string;
  /** Repository full name (owner/repo) - retained for link building. */
  repoFullName?: string;
  /** Optional URL to the artifact on GitHub. */
  url?: string;
  /** Optional importance weight used only as a tie-breaker during reranking. */
  weight?: number;
}

/** A retrieved candidate before reranking. */
export interface RetrievedChunk {
  docId: string;
  repoId: string;
  title: string;
  content: string;
  metadata: DocMetadata;
  /** Cosine distance (pgvector `<=>`), lower is more similar. */
  distance: number;
}

/** A reranked, context-ready chunk. */
export interface RerankedChunk extends RetrievedChunk {
  /** Final hybrid score, higher is better. */
  score: number;
}

/** A single citation surfaced alongside an answer. */
export interface Citation {
  kind: SourceType;
  title: string;
  /** Clickable destination for the artifact. */
  href: string;
  detail: string;
}