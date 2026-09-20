import {
  DEMO_SOURCE,
  projects, repos, prs, allFindings, adrs, docs, activity, insights, reviewsOverTime,
  issues, issueGroups, environments, deployments, techSpecs, integrations,
  findingCounts,
} from './mock/seed';

export type { Project, Repo, PR, Finding, ADR, DocItem, DocStatus, ActivityEvent, Insight, Severity, FindingCategory } from './mock/seed';
export type { Issue, IssueGroup, IssueCategory, IssueStatus } from './mock/seed';
export type { Environment, Deployment, EnvStatus, DeployStatus } from './mock/seed';
export type { TechSpec, SpecKind, SpecStatus, SpecSyncStatus } from './mock/seed';
export type { Integration, IntegrationCategory } from './mock/seed';

/**
 * DevHub data layer.
 *
 * Currently backed entirely by the clearly-labeled `mock/seed` demo data so the
 * redesigned UI can be built before backend endpoints are wired. As real API
 * endpoints exist they are layered on top here; the demo source marker is kept
 * so UI can show "Demo data" where appropriate.
 */
export const dataSource = DEMO_SOURCE;

export const demoMeta = { source: dataSource, banner: 'Demo data — your connected repositories will appear here.' };

export const getProjects = () => projects;
export const getRepos = () => repos;
export const getPRs = () => prs;
export const getFindings = () => allFindings;
export const getADRs = () => adrs;
export const getDocs = () => docs;
export const getActivity = () => activity;
export const getInsights = () => insights;
export const getReviewsOverTime = () => reviewsOverTime;
export const getIssues = () => issues;
export const getIssueGroups = () => issueGroups;
export const getEnvironments = () => environments;
export const getDeployments = () => deployments;
export const getTechSpecs = () => techSpecs;
export const getIntegrations = () => integrations;
export const getFindingCounts = findingCounts;

export const findRepo = (id: string) => repos.find((r) => r.id === id) ?? null;
export const findPR = (prNumber: number) => prs.find((p) => p.number === prNumber) ?? null;
export const findProject = (id: string) => projects.find((p) => p.id === id) ?? null;
export const repoOf = (repoId: string) => repos.find((r) => r.id === repoId) ?? repos[0];
export const repoNameOf = (repoId: string) => repoOf(repoId).name;