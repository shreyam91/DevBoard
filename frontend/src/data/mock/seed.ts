/* ============================================================
   DevHub — DEMO / SEED DATA
   ------------------------------------------------------------------
   This is a clearly-labeled mock layer for UI development only.
   It is NOT production data and is NOT written into any backend.
   Pages render it with a "Demo data" marker wherever shown. Where a
   real API endpoint exists, pages are expected to layer real data
   over these demo projections.
   ============================================================ */

export const DEMO = true as const;
export const DEMO_SOURCE = 'demo' as const;

export interface Project {
  id: string;
  name: string;
  tagline: string;
  repoIds: string[];
  health: { health: number; architecture: number; review: number; documentation: number };
  active: { reviewsWaiting: number; conflicts: number; docUpdates: number };
}

export interface Repo {
  id: string;
  name: string;
  fullName: string;
  tech: string;
  connected: boolean;
  health: { architecture: number; documentation: number; codeQuality: number; aiReview: 'Healthy' | 'Needs attention' | 'Critical' };
  stats: { prs: number; commits: number; contributors: number; openIssues: number };
}

export interface PR {
  id: string;
  number: number;
  repoId: string;
  title: string;
  author: string;
  status: 'open' | 'merged' | 'closed';
  additions: number;
  deletions: number;
  filesChanged: number;
  aiScore: number | null;
  createdAt: string;
  baseBranch: string;
  headBranch: string;
}

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type FindingCategory = 'bug' | 'security' | 'performance' | 'quality' | 'testing' | 'architecture';

export interface Finding {
  id: string;
  severity: Severity;
  category: FindingCategory;
  title: string;
  description: string;
  repoId: string;
  prNumber: number;
  file: string;
  line: number | null;
  confidence: number; // 0..1
  status: 'open' | 'resolved' | 'dismissed';
  suggestion?: string;
}

export interface ADR {
  id: string;
  adrNumber: string; // ADR-027
  title: string;
  status: 'accepted' | 'proposed' | 'superseded';
  date: string; // ISO
  context: string;
  decision: string;
  alternatives: string[];
  consequences: string[];
  relatedPrs: number[];
  relatedDocs: string[];
}

export type DocStatus = 'up_to_date' | 'needs_update' | 'outdated' | 'missing';

export interface DocItem {
  id: string;
  type: string; // PRD, SRS, Architecture...
  status: DocStatus;
  lastUpdated?: string;
  source?: string;
  relatedPr?: number;
  relatedAdr?: string;
  version: string;
  description?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'pr' | 'adr' | 'conflict' | 'doc' | 'review' | 'insight';
  summary: string;
  detail?: string;
  time: string;
  repoId?: string;
}

export interface Insight {
  id: string;
  kind: 'drift' | 'issue' | 'docsDrift';
  severity: Severity;
  title: string;
  description: string;
  repoIds: string[];
}

/* ---------------------------------------------------------- Projects */
export const projects: Project[] = [
  {
    id: 'devhub', name: 'DevHub', tagline: 'AI-powered engineering intelligence', repoIds: ['devhub-api', 'devhub-frontend', 'devhub-worker'],
    health: { health: 86, architecture: 91, review: 82, documentation: 76 },
    active: { reviewsWaiting: 3, conflicts: 2, docUpdates: 5 },
  },
  {
    id: 'jobpulse', name: 'JobPulse', tagline: 'Realtime job-alert platform', repoIds: ['jobpulse-api', 'jobpulse-web'],
    health: { health: 78, architecture: 84, review: 76, documentation: 64 },
    active: { reviewsWaiting: 2, conflicts: 0, docUpdates: 4 },
  },
  {
    id: 'taskflow', name: 'TaskFlow', tagline: 'Workflow automation engine', repoIds: ['taskflow-core'],
    health: { health: 91, architecture: 93, review: 90, documentation: 92 },
    active: { reviewsWaiting: 1, conflicts: 0, docUpdates: 1 },
  },
];

/* ---------------------------------------------------------- Repositories */
export const repos: Repo[] = [
  { id: 'devhub-api', name: 'devhub-api', fullName: 'shreyam91/devhub-api', tech: 'Node.js + Fastify', connected: true, health: { architecture: 91, documentation: 76, codeQuality: 84, aiReview: 'Healthy' }, stats: { prs: 184, commits: 1284, contributors: 9, openIssues: 32 } },
  { id: 'devhub-frontend', name: 'devhub-frontend', fullName: 'shreyam91/devhub-frontend', tech: 'Next.js + React', connected: true, health: { architecture: 88, documentation: 81, codeQuality: 89, aiReview: 'Healthy' }, stats: { prs: 142, commits: 940, contributors: 8, openIssues: 21 } },
  { id: 'devhub-worker', name: 'devhub-worker', fullName: 'shreyam91/devhub-worker', tech: 'Node.js + BullMQ', connected: true, health: { architecture: 83, documentation: 62, codeQuality: 79, aiReview: 'Needs attention' }, stats: { prs: 96, commits: 612, contributors: 5, openIssues: 14 } },
  { id: 'jobpulse-api', name: 'jobpulse-api', fullName: 'shreyam91/jobpulse-api', tech: 'Java + Spring Boot', connected: true, health: { architecture: 84, documentation: 68, codeQuality: 81, aiReview: 'Healthy' }, stats: { prs: 121, commits: 855, contributors: 11, openIssues: 18 } },
  { id: 'jobpulse-web', name: 'jobpulse-web', fullName: 'shreyam91/jobpulse-web', tech: 'Vue + TS', connected: false, health: { architecture: 72, documentation: 55, codeQuality: 70, aiReview: 'Critical' }, stats: { prs: 88, commits: 512, contributors: 7, openIssues: 27 } },
  { id: 'taskflow-core', name: 'taskflow-core', fullName: 'shreyam91/taskflow-core', tech: 'Rust + gRPC', connected: true, health: { architecture: 93, documentation: 92, codeQuality: 91, aiReview: 'Healthy' }, stats: { prs: 205, commits: 1510, contributors: 6, openIssues: 9 } },
];

/* ---------------------------------------------------------- Pull requests */
export const prs: PR[] = [
  { id: 'pr-238', number: 238, repoId: 'devhub-api', title: 'Fix payment timeout handling', author: 'shreyam91', status: 'open', additions: 184, deletions: 76, filesChanged: 42, aiScore: 82, createdAt: '2026-09-09T09:12:00Z', baseBranch: 'main', headBranch: 'fix/timeout' },
  { id: 'pr-237', number: 237, repoId: 'devhub-api', title: 'Add refund endpoint', author: 'amira-dev', status: 'open', additions: 96, deletions: 21, filesChanged: 11, aiScore: 91, createdAt: '2026-09-07T14:30:00Z', baseBranch: 'main', headBranch: 'feat/refunds' },
  { id: 'pr-236', number: 236, repoId: 'devhub-frontend', title: 'Update authentication flows', author: 'leo-ng', status: 'open', additions: 210, deletions: 88, filesChanged: 23, aiScore: 74, createdAt: '2026-09-05T11:03:00Z', baseBranch: 'main', headBranch: 'feat/auth-v2' },
  { id: 'pr-235', number: 235, repoId: 'devhub-api', title: 'Improve caching strategy', author: 'amira-dev', status: 'merged', additions: 55, deletions: 18, filesChanged: 7, aiScore: 88, createdAt: '2026-09-02T08:45:00Z', baseBranch: 'main', headBranch: 'perf/caching' },
  { id: 'pr-234', number: 234, repoId: 'taskflow-core', title: 'Parallel workflow execution', author: 'sam-chen', status: 'merged', additions: 320, deletions: 14, filesChanged: 16, aiScore: 96, createdAt: '2026-08-30T16:20:00Z', baseBranch: 'main', headBranch: 'feat/parallel' },
  { id: 'pr-233', number: 233, repoId: 'devhub-worker', title: 'Add retry backoff for job workers', author: 'priya-k', status: 'open', additions: 74, deletions: 12, filesChanged: 6, aiScore: 79, createdAt: '2026-08-28T10:10:00Z', baseBranch: 'main', headBranch: 'fix/backoff' },
  { id: 'pr-232', number: 232, repoId: 'jobpulse-web', title: 'Redesign job alert filters', author: 'talia-r', status: 'open', additions: 152, deletions: 90, filesChanged: 18, aiScore: 68, createdAt: '2026-08-26T13:55:00Z', baseBranch: 'main', headBranch: 'ui/filters' },
  { id: 'pr-231', number: 231, repoId: 'devhub-api', title: 'Introduce Redis for rate limiting', author: 'shreyam91', status: 'open', additions: 88, deletions: 22, filesChanged: 9, aiScore: 74, createdAt: '2026-08-24T09:40:00Z', baseBranch: 'main', headBranch: 'feat/redis' },
  { id: 'pr-230', number: 230, repoId: 'devhub-frontend', title: 'Refactor state management to zustand', author: 'leo-ng', status: 'merged', additions: 240, deletions: 260, filesChanged: 31, aiScore: 90, createdAt: '2026-08-21T15:00:00Z', baseBranch: 'main', headBranch: 'refactor/state' },
  { id: 'pr-229', number: 229, repoId: 'jobpulse-api', title: 'Fix N+1 on job listings', author: 'niko-v', status: 'merged', additions: 42, deletions: 16, filesChanged: 4, aiScore: 93, createdAt: '2026-08-18T12:30:00Z', baseBranch: 'main', headBranch: 'perf/n+1' },
  { id: 'pr-228', number: 228, repoId: 'taskflow-core', title: 'Add gRPC health checks', author: 'sam-chen', status: 'merged', additions: 67, deletions: 9, filesChanged: 8, aiScore: 95, createdAt: '2026-08-15T17:25:00Z', baseBranch: 'main', headBranch: 'ops/health' },
  { id: 'pr-227', number: 227, repoId: 'devhub-worker', title: 'Write integration tests for queue', author: 'priya-k', status: 'merged', additions: 190, deletions: 30, filesChanged: 14, aiScore: 84, createdAt: '2026-08-12T09:05:00Z', baseBranch: 'main', headBranch: 'test/queue' },
  { id: 'pr-226', number: 226, repoId: 'jobpulse-web', title: 'Dark mode support', author: 'talia-r', status: 'merged', additions: 130, deletions: 24, filesChanged: 12, aiScore: 87, createdAt: '2026-08-09T14:15:00Z', baseBranch: 'main', headBranch: 'feat/darkmode' },
  { id: 'pr-225', number: 225, repoId: 'devhub-frontend', title: 'Add onboarding questionnaire', author: 'shreyam91', status: 'open', additions: 264, deletions: 18, filesChanged: 19, aiScore: 78, createdAt: '2026-08-06T10:00:00Z', baseBranch: 'main', headBranch: 'feat/onboarding' },
  { id: 'pr-224', number: 224, repoId: 'devhub-api', title: 'Schema: add Vector embedding column', author: 'niko-v', status: 'merged', additions: 38, deletions: 5, filesChanged: 3, aiScore: 99, createdAt: '2026-08-03T11:45:00Z', baseBranch: 'main', headBranch: 'data/pgvector' },
];

/* ---------------------------------------------------------- Findings */
const F = (o: Finding): Finding => o;
export const findings: Finding[] = [
  F({ id: 'f1', severity: 'critical', category: 'bug', title: 'Unhandled duplicate payment on retry', description: 'The retry path can execute the payment request again after a timeout even though the provider may already have processed the original request.', repoId: 'devhub-api', prNumber: 238, file: 'src/payment/PaymentService.ts', line: 87, confidence: 0.94, status: 'open', suggestion: 'Use an idempotency key for retry attempts.' }),
  F({ id: 'f2', severity: 'high', category: 'security', title: 'Refund amount not validated against original', description: 'A client can request a refund exceeding the original authorized amount.', repoId: 'devhub-api', prNumber: 237, file: 'src/refunds/RefundService.ts', line: 41, confidence: 0.9, status: 'open', suggestion: 'Clamp refund amount to the remaining authorized balance.' }),
  F({ id: 'f3', severity: 'medium', category: 'bug', title: 'Missing error handling on external API call', description: 'The provider call is not wrapped in try/catch; transient failures surface as 500s.', repoId: 'devhub-api', prNumber: 238, file: 'src/payment/PaymentService.ts', line: 92, confidence: 0.89, status: 'open', suggestion: 'Wrap provider calls and map failures to retryable states.' }),
  F({ id: 'f4', severity: 'high', category: 'architecture', title: 'New Redis usage not reflected in architecture', description: 'PR comes with the caching infra bypassing the architecture baseline for the API.', repoId: 'devhub-api', prNumber: 231, file: 'src/ratelimit/RateLimiter.ts', line: 14, confidence: 0.86, status: 'open' }),
  F({ id: 'f5', severity: 'medium', category: 'performance', title: 'Potential unnecessary database query', description: 'getMany then filters in memory instead of a single parameterized query.', repoId: 'devhub-api', prNumber: 238, file: 'src/orders/OrderService.ts', line: 118, confidence: 0.91, status: 'resolved', suggestion: 'Push the filter into the SQL query.' }),
  F({ id: 'f6', severity: 'medium', category: 'quality', title: 'DRY violation across auth handlers', description: 'Token fetch/refresh logic duplicated in three routes.', repoId: 'devhub-frontend', prNumber: 236, file: 'lib/auth/middleware.ts', line: 30, confidence: 0.8, status: 'open', suggestion: 'Extract a shared getTokenFor() helper.' }),
  F({ id: 'f7', severity: 'low', category: 'testing', title: 'Missing unit test for timeout branch', description: 'The 408 timeout path has no coverage in PaymentService.spec.', repoId: 'devhub-api', prNumber: 238, file: 'src/payment/PaymentService.spec.ts', line: null, confidence: 0.67, status: 'open' }),
  F({ id: 'f8', severity: 'low', category: 'quality', title: 'Dead code: unused import of OrderState', description: 'The OrderState import is no longer used after the refactor.', repoId: 'devhub-api', prNumber: 237, file: 'src/refunds/RefundService.ts', line: 3, confidence: 0.7, status: 'dismissed' }),
  F({ id: 'f9', severity: 'high', category: 'security', title: 'Auth token persisted in sessionStorage', description: 'The Clerk session token is mirrored to sessionStorage, increasing XSS exposure.', repoId: 'devhub-frontend', prNumber: 236, file: 'lib/auth/session.ts', line: 12, confidence: 0.88, status: 'open', suggestion: 'Keep the token in httpOnly cookies only.' }),
  F({ id: 'f10', severity: 'medium', category: 'performance', title: 'Unnecessary re-render of full diff tree', description: 'Diff tree recomputes on every keystroke; should be memoized.', repoId: 'devhub-frontend', prNumber: 230, file: 'components/diff/DiffViewer.tsx', line: 55, confidence: 0.78, status: 'resolved' }),
  F({ id: 'f11', severity: 'critical', category: 'bug', title: 'Workflow status stuck when worker restarts', description: 'In-flight jobs marked running are never recovered after a crash, leaving workflows permanently queued.', repoId: 'taskflow-core', prNumber: 234, file: 'src/executor/runner.rs', line: 123, confidence: 0.93, status: 'open', suggestion: 'Add a lease/recover step that re-enqueues orphaned jobs on startup.' }),
  F({ id: 'f12', severity: 'medium', category: 'testing', title: 'No integration test for backoff sequence', description: 'Backoff behaviour is only asserted via mocks; real Redis timing is untested.', repoId: 'devhub-worker', prNumber: 233, file: 'test/backoff.test.ts', line: null, confidence: 0.72, status: 'open' }),
  F({ id: 'f13', severity: 'low', category: 'quality', title: 'Magic number for retry cap', description: 'The max retry value 5 is hardcoded; make it configurable.', repoId: 'devhub-worker', prNumber: 233, file: 'src/queue/backoff.ts', line: 8, confidence: 0.65, status: 'open' }),
  F({ id: 'f14', severity: 'high', category: 'bug', title: 'Filter state lost on navigation', description: 'Job alert filter selections reset when navigating between pages.', repoId: 'jobpulse-web', prNumber: 232, file: 'views/filters/AlertsFilter.vue', line: 40, confidence: 0.85, status: 'open' }),
  F({ id: 'f15', severity: 'medium', category: 'performance', title: 'Large bundle from unused chart libs', description: 'Two chart libraries shipped though only one is used.', repoId: 'jobpulse-web', prNumber: 232, file: 'main.ts', line: 6, confidence: 0.81, status: 'open' }),
  F({ id: 'f16', severity: 'low', category: 'testing', title: 'Accessibility test missing for filters', description: 'No axe run against the new filter component.', repoId: 'jobpulse-web', prNumber: 232, file: 'views/filters/AlertsFilter.vue', line: null, confidence: 0.6, status: 'open' }),
  F({ id: 'f17', severity: 'medium', category: 'bug', title: 'N+1 query on job listings', description: 'Job listing request issues one query per candidate application.', repoId: 'jobpulse-api', prNumber: 229, file: 'src/jobs/JobListingService.java', line: 118, confidence: 0.89, status: 'resolved', suggestion: 'Use a single join query with batch fetching.' }),
  F({ id: 'f18', severity: 'low', category: 'quality', title: 'Controller contains business logic', description: 'Ordering logic sits in the controller rather than the service layer.', repoId: 'jobpulse-api', prNumber: 229, file: 'src/jobs/JobController.java', line: 44, confidence: 0.66, status: 'open' }),
  F({ id: 'f19', severity: 'medium', category: 'architecture', title: 'Zustand store duplicates server state', description: 'Client store mirrors server entities with no single source of truth.', repoId: 'devhub-frontend', prNumber: 230, file: 'store/entities.ts', line: 9, confidence: 0.77, status: 'resolved' }),
  F({ id: 'f20', severity: 'high', category: 'security', title: 'API key logged in debug output', description: 'The provider key is printed in verbose logs when rate limiting trips.', repoId: 'devhub-api', prNumber: 231, file: 'src/ratelimit/RateLimiter.ts', line: 22, confidence: 0.87, status: 'open', suggestion: 'Redact the key before logging.' }),
  F({ id: 'f21', severity: 'low', category: 'quality', title: 'Missing copyright header', description: 'New Rust files lack the project header used across the repo.', repoId: 'taskflow-core', prNumber: 234, file: 'src/executor/runner.rs', line: 1, confidence: 0.5, status: 'dismissed' }),
  F({ id: 'f22', severity: 'medium', category: 'testing', title: 'Health check has no failure branch test', description: 'The gRPC health handler only tests the healthy case.', repoId: 'taskflow-core', prNumber: 228, file: 'src/health/health_test.rs', line: null, confidence: 0.7, status: 'resolved' }),
];

/* ---- lower-severity filler to reach a richer distribution ---- */
const fillerTuples: [Severity, FindingCategory, string, string, number, string, number | null, number][] = [
  ['medium', 'performance', 'Redundant object spread in hot loop', 'devhub-api', 238, 'src/orders/OrderService.ts', 87, 0.72],
  ['low', 'quality', 'Inconsistent naming: get_items vs fetchItems', 'taskflow-core', 234, 'src/executor/runner.rs', 200, 0.58],
  ['medium', 'bug', 'Race condition on cache write-through', 'devhub-api', 235, 'src/cache/WriteThrough.ts', 33, 0.83],
  ['low', 'testing', 'Snapshot test is too broad to be useful', 'devhub-frontend', 225, 'components/onboarding/Onboarding.test.tsx', null, 0.61],
  ['medium', 'quality', 'Duplicate enum for job status', 'jobpulse-api', 229, 'src/jobs/JobStatus.java', 15, 0.68],
  ['low', 'quality', 'Stringly-typed config keys', 'devhub-worker', 233, 'src/queue/config.ts', 5, 0.55],
  ['medium', 'performance', 'Full array copy in filter pipeline', 'jobpulse-web', 232, 'utils/filter.js', 61, 0.69],
  ['low', 'testing', 'Add pagination test for refunds', 'devhub-api', 237, 'src/refunds/RefundService.spec.ts', null, 0.57],
  ['medium', 'bug', 'Date parse fails on ISO with milliseconds', 'devhub-frontend', 236, 'lib/format.ts', 40, 0.79],
  ['low', 'quality', 'Trailing whitespace on migration file', 'devhub-api', 224, 'prisma/migrations/20260803_vectors/migration.sql', 12, 0.5],
  ['medium', 'performance', 'Unbounded results before limit applied', 'jobpulse-api', 229, 'src/jobs/JobListingService.java', 130, 0.81],
  ['low', 'testing', 'Missing edge case for empty wallet', 'devhub-api', 237, 'src/refunds/RefundService.spec.ts', null, 0.59],
];
const filler: Finding[] = fillerTuples.map(([severity, category, title, repoId, prNumber, file, line, confidence], i) => F({
  id: `fx${i}`, severity, category, title, repoId, prNumber, file, line, confidence,
  status: i % 4 === 0 ? 'resolved' : i % 7 === 0 ? 'dismissed' : 'open',
  description: title + ' — observed in reviewed diff during this PR.',
}));

export const allFindings: Finding[] = [...findings, ...filler];

/* ---------------------------------------------------------- ADRs */
export const adrs: ADR[] = [
  { id: 'adr-027', adrNumber: 'ADR-027', title: 'Use Redis for background jobs', status: 'accepted', date: '2026-09-09T09:00:00Z', context: 'Background job growth exceeded Postgres-backed queue limits during load tests.', decision: 'Adopt BullMQ backed by Redis for all async workloads; keep Postgres as the source of truth for results.', alternatives: ['Celery (Python)', 'Plain Postgres + advisory locks', 'SQS via AWS'], consequences: ['+ High throughput and retry semantics', '+ Battle-tested job UI and stats', '- Adds Redis as new infrastructure dependency'], relatedPrs: [231], relatedDocs: ['doc-arch', 'doc-impl'] },
  { id: 'adr-026', adrNumber: 'ADR-026', title: 'PostgreSQL as primary database', status: 'accepted', date: '2026-09-02T09:00:00Z', context: 'Team required transactional integrity plus vector search for the AI layer.', decision: 'Standardize on PostgreSQL with the pgvector extension for embeddings.', alternatives: ['MongoDB', 'DynamoDB', 'MySQL + external vector store'], consequences: ['+ Single store for relational + vector data', '+ ACID guarantees for billing-critical data', '- Operational expertise required for tuning'], relatedPrs: [224], relatedDocs: ['doc-arch'] },
  { id: 'adr-025', adrNumber: 'ADR-025', title: 'REST for internal APIs', status: 'accepted', date: '2026-08-26T09:00:00Z', context: 'Internal service comms were mixed between custom RPC and HTTP.', decision: 'Use REST over HTTP for all internal service boundaries; gRPC reserved for high-volume streaming.', alternatives: ['gRPC everywhere', 'GraphQL gateway', 'Message-only communication'], consequences: ['+ Simpler debugging and tooling', '+ Codegen avoided for internal routes', '- Higher OpenAPI maintenance'], relatedPrs: [228], relatedDocs: ['doc-techspec', 'doc-impl'] },
  { id: 'adr-024', adrNumber: 'ADR-024', title: 'Use pgvector for semantic search', status: 'superseded', date: '2026-08-15T09:00:00Z', context: 'Architecture retrieval needed vector similarity over decision records.', decision: 'Adopt pgvector with 1536-dim OpenAI embeddings.', alternatives: ['Pinecone', 'Weaviate', 'Faiss'], consequences: ['+ No extra service to run', '- Distance computation cost at query time'], relatedPrs: [224], relatedDocs: ['doc-arch'] },
  { id: 'adr-023', adrNumber: 'ADR-023', title: 'Monorepo with npm workspaces', status: 'accepted', date: '2026-08-10T09:00:00Z', context: 'Shared schemas and DTOs were drifting across three codebases.', decision: 'Consolidate into an npm-workspaces monorepo with shared, backend, and frontend packages.', alternatives: ['Separate repos + git submodules', 'A single deployable', 'Lerna + pnpm'], consequences: ['+ Atomic cross-package changes', '+ Single CI graph', '- Larger initial clone'], relatedPrs: [230], relatedDocs: ['doc-arch'] },
  { id: 'adr-022', adrNumber: 'ADR-022', title: 'Webhook-first GitHub integration', status: 'accepted', date: '2026-07-30T09:00:00Z', context: 'Polling GitHub on a timer wasted quota and lagged events.', decision: 'Process GitHub webhooks as the trigger for all repo intelligence; fall back to on-demand sync.', alternatives: ['Scheduled polling', 'GraphQL subscriptions'], consequences: ['+ Near-instant event handling', '+ Lower API usage', '- Requires public webhook endpoint + secret'], relatedPrs: [225], relatedDocs: ['doc-techspec', 'doc-impl'] },
  { id: 'adr-021', adrNumber: 'ADR-021', title: 'Rate limit by IP with burst buffer', status: 'accepted', date: '2026-07-20T09:00:00Z', context: 'Public endpoints absorbed scheduling spikes causing partial throttling.', decision: 'Token-bucket rate limiting keyed by IP with a small burst buffer.', alternatives: ['Leaky bucket', 'Global quota per tenant'], consequences: ['+ Smooths bursts', '+ Per-tenant isolation via keys', '- Memory per key in Redis'], relatedPrs: [231], relatedDocs: ['doc-impl'] },
  { id: 'adr-020', adrNumber: 'ADR-020', title: 'Next.js for the dashboard', status: 'accepted', date: '2026-07-12T09:00:00Z', context: 'The dashboard needed a single framework for server components and edge-adjacent middleware.', decision: 'Adopt Next.js (App Router) for all user-facing dashboard surfaces.', alternatives: ['Remix', 'Vite + React SPA', 'SvelteKit'], consequences: ['+ Unified data loading', '+ RSC reduces client JS', '- Build/lint coupling with ESLint'], relatedPrs: [230], relatedDocs: ['doc-arch'] },
  { id: 'adr-019', adrNumber: 'ADR-019', title: 'Clients use Clerk for auth', status: 'accepted', date: '2026-07-02T09:00:00Z', context: 'Rolling auth from scratch was out of scope while SSO was a hard requirement.', decision: 'Delegate authentication and SSO to Clerk; mint short-lived GitHub tokens via the OAuth bridge.', alternatives: ['Auth0', 'NextAuth', 'Self-hosted OIDC'], consequences: ['+ Faster time-to-auth, SSO out of the box', '- Data residency depends on Clerk'], relatedPrs: [236], relatedDocs: ['doc-techspec'] },
  { id: 'adr-018', adrNumber: 'ADR-018', title: 'Documentation stored in repo as Markdown', status: 'proposed', date: '2026-09-11T09:00:00Z', context: 'Living documentation should live next to the code it describes.', decision: 'Proposal: store canonical docs as Markdown in-repo, generated drafts via PRs.', alternatives: ['Docs as a DB blob', 'Confluence-managed'], consequences: ['+ Versioned with code', '- Needs a generation pipeline'], relatedPrs: [225], relatedDocs: ['doc-arch', 'doc-deploy'] },
];

/* ---------------------------------------------------------- Documents */
export const docs: DocItem[] = [
  { id: 'doc-prd', type: 'PRD', status: 'up_to_date', lastUpdated: '2026-08-28T09:00:00Z', source: 'docs/prd.md', version: 'v3', description: 'Product requirements for the platform.' },
  { id: 'doc-srs', type: 'SRS', status: 'up_to_date', lastUpdated: '2026-08-20T09:00:00Z', source: 'docs/srs.md', version: 'v2', description: 'Software requirements and acceptance criteria.', relatedPr: 225 },
  { id: 'doc-arch', type: 'Architecture', status: 'needs_update', lastUpdated: '2026-08-15T09:00:00Z', source: 'docs/architecture.md', version: 'v5', description: 'System architecture and component diagram.', relatedPr: 231, relatedAdr: 'ADR-026' },
  { id: 'doc-techspec', type: 'Technical Spec', status: 'up_to_date', lastUpdated: '2026-08-30T09:00:00Z', source: 'docs/tech-spec.md', version: 'v4', description: 'Technical specifications for services.', relatedAdr: 'ADR-025' },
  { id: 'doc-impl', type: 'Implementation', status: 'needs_update', lastUpdated: '2026-09-04T09:00:00Z', source: 'docs/implementation.md', version: 'v6', description: 'Implementation notes and module walkthroughs.', relatedPr: 238, relatedAdr: 'ADR-027' },
  { id: 'doc-deploy', type: 'Deployment', status: 'outdated', lastUpdated: '2026-07-10T09:00:00Z', source: 'docs/deployment.md', version: 'v1', description: 'Deployment and environment configuration.', relatedPr: 231 },
  { id: 'doc-design', type: 'Design', status: 'up_to_date', lastUpdated: '2026-09-06T09:00:00Z', source: 'docs/design.md', version: 'v2', description: 'Design system and UX guidance.', relatedPr: 232 },
];

/* ---------------------------------------------------------- Activity */
export const activity: ActivityEvent[] = [
  { id: 'a1', type: 'review', summary: 'PR #238 reviewed by DevHub AI', detail: '3 findings · 1 high-confidence · 1 critical', time: '2h ago', repoId: 'devhub-api' },
  { id: 'a2', type: 'adr', summary: 'ADR-027 created', detail: 'Use Redis for background jobs', time: '4h ago', repoId: 'devhub-api' },
  { id: 'a3', type: 'review', summary: 'PR #237 reviewed by DevHub AI', detail: '2 findings · 0 critical', time: '5h ago', repoId: 'devhub-api' },
  { id: 'a4', type: 'conflict', summary: 'Architecture conflict detected in PR #231', detail: 'Redis usage not in baseline', time: '1d ago', repoId: 'devhub-api' },
  { id: 'a5', type: 'doc', summary: 'Technical specification updated', detail: 'Payment service spec v4', time: '1d ago', repoId: 'devhub-api' },
  { id: 'a6', type: 'pr', summary: 'PR #236 opened', detail: 'Update authentication flows', time: '2d ago', repoId: 'devhub-frontend' },
  { id: 'a7', type: 'review', summary: 'PR #234 reviewed by DevHub AI', detail: '2 findings · 0 critical', time: '2d ago', repoId: 'taskflow-core' },
  { id: 'a8', type: 'insight', summary: 'Architecture drift detected', detail: '3 PRs introduce patterns outside the baseline', time: '2d ago' },
  { id: 'a9', type: 'doc', summary: 'Implementation docs need update', detail: 'PR #238 added retry/idempotency behaviour', time: '3d ago', repoId: 'devhub-api' },
  { id: 'a10', type: 'conflict', summary: 'Resolved: N+1 performance finding', detail: 'PR #229 · fixed by batching', time: '3d ago', repoId: 'jobpulse-api' },
  { id: 'a11', type: 'review', summary: 'PR #235 reviewed by DevHub AI', detail: '1 finding · 0 critical', time: '4d ago', repoId: 'devhub-api' },
  { id: 'a12', type: 'pr', summary: 'PR #233 opened', detail: 'Add retry backoff for job workers', time: '4d ago', repoId: 'devhub-worker' },
  { id: 'a13', type: 'adr', summary: 'ADR-026 accepted', detail: 'PostgreSQL as primary database', time: '5d ago' },
  { id: 'a14', type: 'doc', summary: 'Deployment docs outdated', detail: 'Repo now deploys via Docker but docs describe VMs', time: '5d ago', repoId: 'devhub-api' },
  { id: 'a15', type: 'review', summary: 'PR #232 reviewed by DevHub AI', detail: '3 findings · 1 high-confidence', time: '6d ago', repoId: 'jobpulse-web' },
  { id: 'a16', type: 'insight', summary: 'Repeated issue detected', detail: '5 PRs miss error handling around external calls', time: '1w ago' },
  { id: 'a17', type: 'pr', summary: 'PR #230 refactor merged', detail: 'State management to zustand', time: '1w ago', repoId: 'devhub-frontend' },
  { id: 'a18', type: 'adr', summary: 'ADR-024 superseded', detail: 'pgvector adopted over external vector store', time: '1w ago' },
  { id: 'a19', type: 'review', summary: 'PR #229 reviewed by DevHub AI', detail: '1 finding · 0 critical', time: '1w ago', repoId: 'jobpulse-api' },
  { id: 'a20', type: 'conflict', summary: 'Architecture conflict detected in PR #236', detail: 'Auth flow diverges from ADR-019', time: '1w ago', repoId: 'devhub-frontend' },
  { id: 'a21', type: 'pr', summary: 'PR #225 opened', detail: 'Add onboarding questionnaire', time: '1w ago', repoId: 'devhub-frontend' },
  { id: 'a22', type: 'doc', summary: 'Design docs updated', detail: 'Design system v2 shipped', time: '6d ago', repoId: 'jobpulse-web' },
];

/* ---------------------------------------------------------- Insights */
export const insights: Insight[] = [
  { id: 'i1', kind: 'drift', severity: 'high', title: 'Architecture drift detected', description: '3 PRs introduced patterns not represented in the current architecture baseline. Review ADR-021 and ADR-027 for alignment.', repoIds: ['devhub-api', 'devhub-worker'] },
  { id: 'i2', kind: 'issue', severity: 'medium', title: 'Repeated issue detected', description: '5 recent PRs contain missing error handling around external API calls. Consider a shared REST client with built-in retry.', repoIds: ['devhub-api', 'jobpulse-api'] },
  { id: 'i3', kind: 'docsDrift', severity: 'medium', title: 'Documentation drift', description: 'Deployment documentation is behind the current repository configuration (Docker vs documented VMs).', repoIds: ['devhub-api'] },
  { id: 'i4', kind: 'issue', severity: 'low', title: 'Frontend re-render hot spots', description: '2 components re-render on every keystroke. Memoizing reduces main-thread work by an estimated 18%.', repoIds: ['devhub-frontend'] },
  { id: 'i5', kind: 'drift', severity: 'medium', title: 'Auth flows diverging from ADR-019', description: 'Middleware duplicated token logic inconsistent with the Clerk bridge decision.', repoIds: ['devhub-frontend', 'jobpulse-web'] },
  { id: 'i6', kind: 'docsDrift', severity: 'low', title: 'Implementation spec lag', description: 'API module walkthroughs predate the retry/idempotency changes.', repoIds: ['devhub-api'] },
];

/* ---------------------------------------------------------- Issues */
export type IssueCategory = 'bug' | 'security' | 'performance' | 'ux' | 'quality';
export type IssueStatus = 'open' | 'triage' | 'assigned' | 'resolved' | 'closed';

export interface IssueGroup {
  id: string;
  title: string;
  description: string;
  memberNumbers: number[];
  confidence: number; // 0..1
  repoIds: string[];
}

export interface Issue {
  id: string;
  number: number;
  repoId: string;
  title: string;
  category: IssueCategory;
  priority: Severity;
  status: IssueStatus;
  assignee?: string;
  createdAt: string; // ISO
  aiGroup?: string; // issue group id
  aiConfidence?: number; // 0..1
  detectedByAi?: boolean;
}

export const issues: Issue[] = [
  { id: 'iss-101', number: 101, repoId: 'devhub-api', title: 'Payment retry can double-charge a customer', category: 'bug', priority: 'critical', status: 'assigned', assignee: 'shreyam91', createdAt: '2026-09-08T09:00:00Z', aiGroup: 'grp-payment', aiConfidence: 0.94, detectedByAi: true },
  { id: 'iss-102', number: 102, repoId: 'devhub-api', title: 'Refund endpoint accepts amount above authorization', category: 'security', priority: 'high', status: 'triage', createdAt: '2026-09-07T12:30:00Z', aiGroup: 'grp-payment', aiConfidence: 0.9, detectedByAi: true },
  { id: 'iss-103', number: 103, repoId: 'devhub-api', title: 'Order list queries the DB once per row (N+1)', category: 'performance', priority: 'medium', status: 'open', createdAt: '2026-09-06T10:00:00Z', aiGroup: 'grp-n1', aiConfidence: 0.89, detectedByAi: true },
  { id: 'iss-104', number: 104, repoId: 'devhub-api', title: 'External provider calls not wrapped in error handling', category: 'bug', priority: 'high', status: 'triage', createdAt: '2026-09-05T15:20:00Z', aiGroup: 'grp-err', aiConfidence: 0.86, detectedByAi: true },
  { id: 'iss-105', number: 105, repoId: 'devhub-frontend', title: 'Rate limiter logs the API key on trip', category: 'security', priority: 'high', status: 'assigned', assignee: 'leo-ng', createdAt: '2026-09-04T08:00:00Z', aiGroup: 'grp-secrets', aiConfidence: 0.87, detectedByAi: true },
  { id: 'iss-106', number: 106, repoId: 'devhub-frontend', title: 'Diff tree re-renders on every keystroke', category: 'performance', priority: 'medium', status: 'resolved', createdAt: '2026-09-02T11:00:00Z', detectedByAi: false },
  { id: 'iss-107', number: 107, repoId: 'devhub-worker', title: 'In-flight jobs stuck when worker restarts', category: 'bug', priority: 'critical', status: 'assigned', assignee: 'priya-k', createdAt: '2026-09-01T09:30:00Z', aiGroup: 'grp-err', aiConfidence: 0.93, detectedByAi: true },
  { id: 'iss-108', number: 108, repoId: 'taskflow-core', title: 'Retry cap (5) is a hardcoded magic number', category: 'quality', priority: 'low', status: 'open', createdAt: '2026-08-30T14:00:00Z', detectedByAi: false },
  { id: 'iss-109', number: 109, repoId: 'jobpulse-web', title: 'Job alert filters reset on navigation', category: 'bug', priority: 'high', status: 'open', createdAt: '2026-08-28T16:40:00Z', aiGroup: 'grp-err', aiConfidence: 0.85, detectedByAi: true },
  { id: 'iss-110', number: 110, repoId: 'jobpulse-web', title: 'Two chart libs shipped, one unused', category: 'performance', priority: 'medium', status: 'triage', createdAt: '2026-08-26T10:10:00Z', aiGroup: 'grp-n1', aiConfidence: 0.81, detectedByAi: true },
  { id: 'iss-111', number: 111, repoId: 'jobpulse-api', title: 'Job listing issues one query per candidate', category: 'performance', priority: 'medium', status: 'resolved', assignee: 'niko-v', createdAt: '2026-08-24T09:00:00Z', aiGroup: 'grp-n1', aiConfidence: 0.89, detectedByAi: true },
  { id: 'iss-112', number: 112, repoId: 'jobpulse-api', title: 'Ordering logic sits in the controller layer', category: 'quality', priority: 'low', status: 'open', createdAt: '2026-08-20T13:25:00Z', detectedByAi: false },
  { id: 'iss-113', number: 113, repoId: 'devhub-frontend', title: 'Auth token mirrored to sessionStorage', category: 'security', priority: 'high', status: 'triage', createdAt: '2026-08-18T11:00:00Z', aiGroup: 'grp-secrets', aiConfidence: 0.88, detectedByAi: true },
  { id: 'iss-114', number: 114, repoId: 'devhub-frontend', title: 'Date parser fails on ISO with milliseconds', category: 'bug', priority: 'medium', status: 'open', createdAt: '2026-08-15T08:45:00Z', aiGroup: 'grp-err', aiConfidence: 0.79, detectedByAi: true },
  { id: 'iss-115', number: 115, repoId: 'devhub-api', title: 'Snapshot test too broad to be useful', category: 'quality', priority: 'low', status: 'closed', createdAt: '2026-08-10T15:00:00Z', detectedByAi: false },
  { id: 'iss-116', number: 116, repoId: 'taskflow-core', title: 'gRPC health handler lacks failure-branch test', category: 'quality', priority: 'medium', status: 'resolved', createdAt: '2026-08-06T10:30:00Z', aiGroup: 'grp-n1', aiConfidence: 0.7, detectedByAi: true },
];

export const issueGroups: IssueGroup[] = [
  { id: 'grp-payment', title: 'Payment gateway duplication', description: 'Retry and refund paths risk duplicate or over-limit charges. Mitigate with idempotency keys and authorization clamping.', memberNumbers: [101, 102], confidence: 0.92, repoIds: ['devhub-api'] },
  { id: 'grp-err', title: 'Unhandled failure paths', description: 'External calls crash or revisit state without recovery across four services.', memberNumbers: [104, 107, 109, 114], confidence: 0.88, repoIds: ['devhub-api', 'devhub-worker', 'jobpulse-web', 'devhub-frontend'] },
  { id: 'grp-n1', title: 'N+1 query patterns', description: 'Multiple services issue per-row queries; push filters and joins into SQL.', memberNumbers: [103, 110, 111, 116], confidence: 0.85, repoIds: ['devhub-api', 'jobpulse-web', 'jobpulse-api', 'taskflow-core'] },
  { id: 'grp-secrets', title: 'Credential exposure risk', description: 'Tokens and keys surface in logs or client-side storage.', memberNumbers: [105, 113], confidence: 0.9, repoIds: ['devhub-frontend', 'devhub-api'] },
];

/* ---------------------------------------------------------- Deployment */
export type EnvStatus = 'healthy' | 'degraded' | 'outage';
export type DeployStatus = 'success' | 'failed' | 'in_progress' | 'rolling';

export interface Environment {
  id: string;
  name: string;
  status: EnvStatus;
  url: string;
  health: number; // 0..100
  lastDeploy: string; // ISO
}

export interface Deployment {
  id: string;
  serviceRepositoryId: string;
  env: string;
  version: string;
  status: DeployStatus;
  openedBy: string;
  startedAt: string; // ISO
  duration: number; // seconds
  branch: string;
}

export const environments: Environment[] = [
  { id: 'env-prod', name: 'Production', status: 'healthy', url: 'https://devhub.shreyam91.com', health: 99.98, lastDeploy: '2026-09-11T08:30:00Z' },
  { id: 'env-staging', name: 'Staging', status: 'healthy', url: 'https://staging.devhub.shreyam91.com', health: 99.2, lastDeploy: '2026-09-10T22:15:00Z' },
  { id: 'env-preview', name: 'Preview', status: 'degraded', url: 'https://preview.devhub.shreyam91.com', health: 96.4, lastDeploy: '2026-09-09T17:40:00Z' },
];

export const deployments: Deployment[] = [
  { id: 'dep-1', serviceRepositoryId: 'devhub-api', env: 'Production', version: 'v2.14.0', status: 'success', openedBy: 'shreyam91', startedAt: '2026-09-11T08:25:00Z', duration: 342, branch: 'main' },
  { id: 'dep-2', serviceRepositoryId: 'devhub-frontend', env: 'Production', version: 'v3.8.1', status: 'success', openedBy: 'leo-ng', startedAt: '2026-09-11T08:10:00Z', duration: 264, branch: 'main' },
  { id: 'dep-3', serviceRepositoryId: 'jobpulse-web', env: 'Production', version: 'v1.22.0', status: 'rolling', openedBy: 'talia-r', startedAt: '2026-09-10T20:00:00Z', duration: 0, branch: 'main' },
  { id: 'dep-4', serviceRepositoryId: 'devhub-worker', env: 'Staging', version: 'v1.9.3', status: 'failed', openedBy: 'priya-k', startedAt: '2026-09-10T22:10:00Z', duration: 152, branch: 'fix/backoff' },
  { id: 'dep-5', serviceRepositoryId: 'taskflow-core', env: 'Production', version: 'v0.31.2', status: 'success', openedBy: 'sam-chen', startedAt: '2026-09-10T14:30:00Z', duration: 418, branch: 'main' },
  { id: 'dep-6', serviceRepositoryId: 'jobpulse-api', env: 'Production', version: 'v4.5.0', status: 'success', openedBy: 'niko-v', startedAt: '2026-09-09T18:45:00Z', duration: 205, branch: 'main' },
  { id: 'dep-7', serviceRepositoryId: 'devhub-frontend', env: 'Staging', version: 'v3.8.0', status: 'success', openedBy: 'leo-ng', startedAt: '2026-09-09T12:00:00Z', duration: 198, branch: 'feat/auth-v2' },
  { id: 'dep-8', serviceRepositoryId: 'devhub-api', env: 'Preview', version: 'v2.14.0-rc.2', status: 'success', openedBy: 'amira-dev', startedAt: '2026-09-09T16:30:00Z', duration: 150, branch: 'feat/refunds' },
  { id: 'dep-9', serviceRepositoryId: 'devhub-api', env: 'Production', version: 'v2.13.4', status: 'success', openedBy: 'shreyam91', startedAt: '2026-09-08T09:20:00Z', duration: 320, branch: 'main' },
  { id: 'dep-10', serviceRepositoryId: 'jobpulse-web', env: 'Preview', version: 'v1.22.0-preview', status: 'success', openedBy: 'talia-r', startedAt: '2026-09-08T15:10:00Z', duration: 132, branch: 'ui/filters' },
  { id: 'dep-11', serviceRepositoryId: 'devhub-worker', env: 'Production', version: 'v1.9.2', status: 'success', openedBy: 'priya-k', startedAt: '2026-09-07T11:40:00Z', duration: 220, branch: 'main' },
  { id: 'dep-12', serviceRepositoryId: 'taskflow-core', env: 'Staging', version: 'v0.31.1', status: 'in_progress', openedBy: 'sam-chen', startedAt: '2026-09-11T07:55:00Z', duration: 0, branch: 'feat/parallel' },
];

/* ---------------------------------------------------------- Tech specs */
export type SpecKind = 'rfc' | 'api' | 'implementation' | 'migration';
export type SpecStatus = 'proposed' | 'in_review' | 'approved' | 'superseded';
export type SpecSyncStatus = 'in_sync' | 'needs_update' | 'unknown';

export interface TechSpec {
  id: string;
  specNumber: string; // SPEC-0xx
  title: string;
  kind: SpecKind;
  status: SpecStatus;
  version: string;
  author: string;
  date: string; // ISO
  syncStatus: SpecSyncStatus;
  description: string;
  relatedPrs: number[];
  repositoryId: string;
}

export const techSpecs: TechSpec[] = [
  { id: 'spec-001', specNumber: 'SPEC-001', title: 'Webhook-first GitHub integration', kind: 'rfc', status: 'approved', version: 'v3', author: 'shreyam91', date: '2026-07-30T09:00:00Z', syncStatus: 'in_sync', description: 'Process GitHub webhooks as the trigger for all repo intelligence, with on-demand sync fallback.', relatedPrs: [225], repositoryId: 'devhub-api' },
  { id: 'spec-002', specNumber: 'SPEC-002', title: 'Background jobs on BullMQ + Redis', kind: 'implementation', status: 'approved', version: 'v2', author: 'priya-k', date: '2026-09-09T09:00:00Z', syncStatus: 'needs_update', description: 'Queue semantics, retry/backoff, and result persistence for async workloads.', relatedPrs: [231, 238], repositoryId: 'devhub-worker' },
  { id: 'spec-003', specNumber: 'SPEC-003', title: 'Payment service API', kind: 'api', status: 'approved', version: 'v4', author: 'amira-dev', date: '2026-08-30T09:00:00Z', syncStatus: 'needs_update', description: 'Charge, refund, and idempotency contract for the payment provider bridge.', relatedPrs: [237, 238], repositoryId: 'devhub-api' },
  { id: 'spec-004', specNumber: 'SPEC-004', title: 'Clerk auth + OAuth token bridge', kind: 'implementation', status: 'approved', version: 'v1', author: 'leo-ng', date: '2026-07-02T09:00:00Z', syncStatus: 'in_sync', description: 'Short-lived GitHub token minting atop Clerk sessions and SSO.', relatedPrs: [236], repositoryId: 'devhub-frontend' },
  { id: 'spec-005', specNumber: 'SPEC-005', title: 'Semantic vector search with pgvector', kind: 'migration', status: 'superseded', version: 'v2', author: 'niko-v', date: '2026-08-15T09:00:00Z', syncStatus: 'unknown', description: '1536-dim embedding storage and query plan; superseded by lexical retrieval.', relatedPrs: [224], repositoryId: 'devhub-api' },
  { id: 'spec-006', specNumber: 'SPEC-006', title: 'Rate limiting by IP with burst buffer', kind: 'rfc', status: 'in_review', version: 'v1', author: 'shreyam91', date: '2026-09-05T10:00:00Z', syncStatus: 'in_sync', description: 'Token-bucket limiter keyed by IP with a small burst allowance.', relatedPrs: [231], repositoryId: 'devhub-api' },
  { id: 'spec-007', specNumber: 'SPEC-007', title: 'Parallel workflow executor', kind: 'implementation', status: 'proposed', version: 'v1', author: 'sam-chen', date: '2026-09-08T13:00:00Z', syncStatus: 'in_sync', description: 'DAG-based parallel execution with lease-recovery for orphaned jobs.', relatedPrs: [234], repositoryId: 'taskflow-core' },
  { id: 'spec-008', specNumber: 'SPEC-008', title: 'zustand state management migration', kind: 'migration', status: 'approved', version: 'v2', author: 'leo-ng', date: '2026-08-21T15:00:00Z', syncStatus: 'needs_update', description: 'Client store consolidation and server-state ownership.', relatedPrs: [230], repositoryId: 'devhub-frontend' },
];

/* ---------------------------------------------------------- Integrations */
export type IntegrationCategory = 'source' | 'ci' | 'messaging' | 'database' | 'ai';

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  connected: boolean;
  settings: { label: string; value: string }[];
}

export const integrations: Integration[] = [
  { id: 'int-github', name: 'GitHub', category: 'source', description: 'Repository webhooks and App connections that feed PR, issue, and commit events.', connected: true, settings: [{ label: 'Organizations', value: 'shreyam91' }, { label: 'Repositories', value: '6 connected' }] },
  { id: 'int-actions', name: 'GitHub Actions', category: 'ci', description: 'CI run status linked to deployment gating and pull requests.', connected: false, settings: [{ label: 'Workflows', value: '12 tracked' }] },
  { id: 'int-slack', name: 'Slack', category: 'messaging', description: 'Review and deployment notifications delivered to your workspace channels.', connected: true, settings: [{ label: 'Workspace', value: 'devboard-team' }, { label: 'Channels', value: '#reviews, #deploys' }] },
  { id: 'int-linear', name: 'Linear', category: 'messaging', description: 'Issue triage and AI-grouped findings synced back to your issue tracker.', connected: false, settings: [{ label: 'Team', value: '—' }] },
  { id: 'int-postgres', name: 'PostgreSQL + pgvector', category: 'database', description: 'Relational and vector store behind the AI reader.', connected: true, settings: [{ label: 'Engine', value: '16.x + pgvector' }, { label: 'Region', value: 'us-east-1' }] },
  { id: 'int-anthropic', name: 'Anthropic (AI provider)', category: 'ai', description: 'The LLM powering PR review, issue grouping, and insight generation.', connected: true, settings: [{ label: 'Model', value: 'claude-sonnet-5' }, { label: 'Feature flag', value: 'LLM_FEATURES_ENABLED' }] },
];

/* ---------------------------------------------------------- Reviews over time (demo chart) */
export const reviewsOverTime: { label: string; count: number }[] = [
  { label: 'Mon', count: 0 }, { label: 'Tue', count: 0 }, { label: 'Wed', count: 4 }, { label: 'Thu', count: 9 },
  { label: 'Fri', count: 16 }, { label: 'Sat', count: 12 }, { label: 'Sun', count: 18 },
  { label: 'Mon', count: 26 }, { label: 'Tue', count: 40 }, { label: 'Wed', count: 34 }, { label: 'Thu', count: 42 },
];

/** Aggregate counts derived from the demo findings (kept derived, not hardcoded). */
export function findingCounts() {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, total: allFindings.length, open: 0, resolved: 0, dismissed: 0 };
  for (const f of allFindings) {
    counts[f.severity]++;
    counts[f.status]++;
  }
  return counts;
}