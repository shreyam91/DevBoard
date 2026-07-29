import { Job } from 'bullmq';
import { prisma } from '@devboard/shared/src/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPEN_AI_API || process.env.OPENAI_API_KEY 
});

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
    include: { user: { include: { accounts: true } } },
  });

  if (!repo) {
    throw new Error('Repo not found');
  }
  const token = repo.user.github_access_token || repo.user.accounts.find(a => a.provider === 'github')?.access_token;
  if (!token) {
    throw new Error('GitHub token not found');
  }

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
1. "newDecisions": If the PR introduces a NEW architectural pattern, library, or structural choice that isn't documented, suggest new decisions. Each must have title, description, rationale, confidence (0-1), affected_files, suggested_markdown.
2. "conflicts": If the PR explicitly violates an existing decision or the architecture, list them. Each conflict must include "decisionId", "decisionTitle", "reason", "confidence" (0-1), and "severity" ('low'|'medium'|'high').

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

  const responseSchema = {
    type: "json_schema",
    json_schema: {
      name: "pr_analysis",
      schema: {
        type: "object",
        properties: {
          newDecisions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                rationale: { type: "string" },
                confidence: { type: "number" },
                affected_files: { type: "array", items: { type: "string" } },
                suggested_markdown: { type: "string" }
              },
              required: ["title", "description", "rationale", "confidence", "affected_files", "suggested_markdown"]
            }
          },
          conflicts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                decisionId: { type: "string" },
                decisionTitle: { type: "string" },
                reason: { type: "string" },
                confidence: { type: "number" },
                severity: { type: "string", enum: ["low", "medium", "high"] }
              },
              required: ["decisionId", "decisionTitle", "reason", "confidence", "severity"]
            }
          }
        },
        required: ["conflicts", "newDecisions"],
        additionalProperties: false
      }
    }
  };

  const msg = await openai.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: responseSchema as any
  });

  const content = msg.choices[0]?.message?.content;
  if (!content) {
    throw new Error('LLM did not return any content');
  }

  const result = JSON.parse(content) as {
    newDecisions: { title: string; description: string; rationale: string; confidence: number; affected_files: string[]; suggested_markdown: string; }[];
    conflicts: { decisionId: string; decisionTitle: string; reason: string; confidence: number; severity: string; }[];
  };
  const { newDecisions, conflicts } = result;

  // 5. pgvector Similarity Search as a fallback for conflict detection
  let vectorConflicts: { decisionId: string; decisionTitle: string; reason: string; confidence: number; severity: string; }[] = [];
  try {
    const prSummaryText = `PR: ${prTitle}\nDiff:\n${diffSummary.substring(0, 1000)}`;
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: prSummaryText,
      encoding_format: 'float',
    });
    const embedding = embeddingRes.data[0].embedding;

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
        reason: 'Flagged by semantic similarity (Cosine Distance: ' + d.distance.toFixed(3) + ')',
        confidence: 0.8,
        severity: 'medium'
      }));

  } catch (error) {
    console.warn('Vector similarity search failed, continuing without it:', error);
  }

  // Deduplicate conflicts
  const allConflictsMap = new Map<string, { decisionId: string; decisionTitle: string; reason: string; confidence: number; severity: string; }>();
  
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
    // A) Suggested Decisions -> Pending Decisions
    if (newDecisions && Array.isArray(newDecisions)) {
      for (const nd of newDecisions) {
        await tx.pendingDecision.create({
          data: {
            repo_id: repoId,
            pr_number: prNumber,
            title: nd.title,
            description: nd.description,
            rationale: nd.rationale,
            confidence: nd.confidence,
            affected_files: nd.affected_files,
            suggested_markdown: nd.suggested_markdown,
            status: 'pending'
          }
        });
      }
    }

    // B) Conflicts
    for (const conflict of finalConflicts) {
      // Verify decision exists
      const exists = decisions.find(d => d.id === conflict.decisionId);
      if (exists) {
        await tx.conflict.create({
          data: {
            repo_id: repoId,
            pr_number: prNumber,
            decision_id: conflict.decisionId,
            pr_url: prUrl,
            pr_title: prTitle,
            description: conflict.reason,
            confidence: conflict.confidence,
            severity: conflict.severity,
            status: 'open',
            resolved: false,
          }
        });
      }
    }
    
    // C) Update AnalysisJob Status
    if (job.data.jobId) {
      await tx.analysisJob.update({
        where: { id: job.data.jobId },
        data: { status: 'completed' }
      });
    }
  });

  // Trigger Score Recalculation
  const { architectureScoreQueue } = await import('@devboard/shared/src/queue');
  await architectureScoreQueue.add('architecture-score', { repoId });

  console.log(`PR Analysis completed for ${repoFullName} PR #${prNumber}`);
}
