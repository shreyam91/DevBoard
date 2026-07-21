import { Job } from 'bullmq';
import { prisma } from '../lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Utility to fetch PR diff
async function fetchDiff(repoFullName: string, prNumber: number, token: string) {
  const res = await fetch(`https://api.github.com/repos/${repoFullName}/pulls/${prNumber}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3.diff',
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch PR diff: ${res.statusText}`);
  }
  return res.text();
}

// Utility to filter diff
function filterDiff(diff: string) {
  // A naive filter to skip lock files for the LLM
  const lines = diff.split('\n');
  const filtered: string[] = [];
  let skip = false;
  
  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      if (line.includes('package-lock.json') || line.includes('yarn.lock') || line.includes('pnpm-lock.yaml')) {
        skip = true;
      } else {
        skip = false;
      }
    }
    if (!skip) {
      filtered.push(line);
    }
  }
  // Truncate if diff is too large (just taking first 20k chars as a safety limit)
  return filtered.join('\n').substring(0, 20000);
}

export async function processPrAnalysisJob(job: Job) {
  const { repoId, repoFullName, prNumber, prTitle, prUrl } = job.data;

  // 1. Fetch Repo & Token
  const repo = await prisma.repo.findUnique({
    where: { id: repoId },
    include: { user: true },
  });

  if (!repo || !repo.user.github_access_token) {
    throw new Error('Repo or token not found');
  }
  const token = repo.user.github_access_token;

  // 2. Fetch Diff
  const rawDiff = await fetchDiff(repoFullName, prNumber, token);
  const diffSummary = filterDiff(rawDiff);

  // 3. Fetch Architecture & Decisions
  const archFile = await prisma.architectureFile.findFirst({
    where: { repo_id: repoId },
    orderBy: { version: 'desc' },
  });

  const decisions = await prisma.decision.findMany({
    where: { repo_id: repoId },
    select: { id: true, title: true, rationale: true, category: true }
  });

  if (!archFile) {
    console.log(`No architecture file found for repo ${repoId}. Skipping PR analysis.`);
    return;
  }

  // 4. Claude Analysis
  const systemPrompt = `You are an expert software architect. Analyze the provided Pull Request Diff against the current ARCHITECTURE.md and the list of existing architectural decisions.
You must return a JSON object with:
1. "suggestedDecision": If the PR introduces a NEW architectural pattern, library, or structural choice that isn't documented, suggest a new decision (title, rationale, category). Otherwise null.
2. "conflicts": If the PR explicitly violates an existing decision or the architecture, list them. Each conflict must include "decisionId", "decisionTitle", and "reason".

Category enum: "database", "infra", "api", "architecture", "tooling".`;

  const userPrompt = `
<PR_TITLE>${prTitle}</PR_TITLE>
<PR_DIFF>${diffSummary}</PR_DIFF>

<CURRENT_ARCHITECTURE>
${archFile.content}
</CURRENT_ARCHITECTURE>

<EXISTING_DECISIONS>
${JSON.stringify(decisions, null, 2)}
</EXISTING_DECISIONS>
`;

  const msg = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    tools: [{
      name: 'save_pr_analysis',
      description: 'Save the PR analysis results',
      input_schema: {
        type: 'object',
        properties: {
          suggestedDecision: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              rationale: { type: 'string' },
              category: { type: 'string', enum: ['database', 'infra', 'api', 'architecture', 'tooling'] }
            },
            nullable: true
          },
          conflicts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                decisionId: { type: 'string' },
                decisionTitle: { type: 'string' },
                reason: { type: 'string' }
              },
              required: ['decisionId', 'decisionTitle', 'reason']
            }
          }
        },
        required: ['conflicts']
      }
    }],
    tool_choice: { type: 'tool', name: 'save_pr_analysis' }
  });

  const toolBlock = msg.content.find((c) => c.type === 'tool_use');
  if (!toolBlock || toolBlock.type !== 'tool_use') {
    throw new Error('Claude did not return a tool_use block');
  }

  const result = toolBlock.input as {
    suggestedDecision?: { title: string; rationale: string; category: string };
    conflicts?: { decisionId: string; decisionTitle: string; reason: string }[];
  };
  const { suggestedDecision, conflicts } = result;

  // 5. pgvector Similarity Search as a fallback for conflict detection
  let vectorConflicts: { decisionId: string; decisionTitle: string; reason: string }[] = [];
  try {
    const prSummaryText = `PR: ${prTitle}\nDiff:\n${diffSummary.substring(0, 1000)}`;
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: prSummaryText,
      encoding_format: 'float',
    });
    const embedding = embeddingRes.data[0].embedding;

    // Use <-> (Euclidean distance) or <=> (Cosine distance). We'll use <=> for cosine.
    // We want decisions where similarity > 0.85 (which means cosine distance < 0.15).
    const similarDecisions: Array<{ id: string, title: string, distance: number }> = await prisma.$queryRaw`
      SELECT id, title, embedding <=> ${embedding}::vector AS distance
      FROM decisions
      WHERE repo_id = ${repoId}
      ORDER BY distance ASC
      LIMIT 5
    `;

    vectorConflicts = similarDecisions
      .filter(d => d.distance < 0.15)
      .map(d => ({
        decisionId: d.id,
        decisionTitle: d.title,
        reason: 'Flagged by semantic similarity (Cosine Distance: ' + d.distance.toFixed(3) + ')'
      }));

  } catch (error) {
    console.warn('Vector similarity search failed, continuing without it:', error);
  }

  // Deduplicate conflicts
  const allConflictsMap = new Map<string, { decisionId: string; decisionTitle: string; reason: string }>();
  
  if (conflicts && Array.isArray(conflicts)) {
    conflicts.forEach((c) => allConflictsMap.set(c.decisionId, c));
  }
  
  vectorConflicts.forEach((vc) => {
    if (!allConflictsMap.has(vc.decisionId)) {
      allConflictsMap.set(vc.decisionId, vc);
    }
  });

  const finalConflicts = Array.from(allConflictsMap.values());

  // 6. Persistence
  await prisma.$transaction(async (tx) => {
    // A) Suggested Decision
    if (suggestedDecision && suggestedDecision.title) {
      // Generate embedding for the new decision
      const embedRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: `Title: ${suggestedDecision.title}\nRationale: ${suggestedDecision.rationale}`,
        encoding_format: 'float',
      });
      
      const newDecisionId = crypto.randomUUID();
      await tx.$executeRaw`
        INSERT INTO decisions (id, repo_id, title, rationale, category, source, pr_url, embedding, created_at, confirmed_by_user)
        VALUES (
          ${newDecisionId},
          ${repoId},
          ${suggestedDecision.title},
          ${suggestedDecision.rationale},
          ${suggestedDecision.category}::"Category",
          'pr'::"Source",
          ${prUrl},
          ${embedRes.data[0].embedding}::vector,
          NOW(),
          false
        )
      `;
    }

    // B) Conflicts
    for (const conflict of finalConflicts) {
      // Verify decision exists (prevent foreign key errors if Claude hallucinates)
      const exists = decisions.find(d => d.id === conflict.decisionId);
      if (exists) {
        await tx.conflict.create({
          data: {
            decision_id: conflict.decisionId,
            pr_url: prUrl,
            pr_title: prTitle,
            description: conflict.reason,
            resolved: false,
          }
        });
      }
    }
  });

  console.log(`PR Analysis completed for ${repoFullName} PR #${prNumber}`);
}
