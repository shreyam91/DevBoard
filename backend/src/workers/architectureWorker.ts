import { Job } from 'bullmq';
import { prisma } from '@devboard/shared/src/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPEN_AI_API || process.env.OPENAI_API_KEY 
});

// Utility to push to GitHub
async function pushToGitHub(repoFullName: string, token: string, path: string, content: string, message: string) {
  // Get current file sha
  let sha: string | undefined;
  try {
    const res = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }
  } catch (e) {
    console.warn(`File ${path} not found on GitHub, creating new one.`);
  }

  const encodedContent = Buffer.from(content).toString('base64');
  
  const payload: any = {
    message,
    content: encodedContent,
    branch: 'main', // assuming main branch
  };
  
  if (sha) {
    payload.sha = sha;
  }

  const putRes = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    // Some repos might use master instead of main. Fallback to master if 422 or 404
    if (putRes.status === 422 || putRes.status === 404) {
       console.log(`Failed to push to main, trying master...`);
       payload.branch = 'master';
       const retryRes = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${path}`, {
         method: 'PUT',
         headers: {
           Authorization: `Bearer ${token}`,
           Accept: 'application/vnd.github.v3+json',
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(payload),
       });
       if (!retryRes.ok) {
         throw new Error(`Failed to commit file to GitHub on master branch: ${retryRes.statusText} - ${await retryRes.text()}`);
       }
       return retryRes.json();
    } else {
       throw new Error(`Failed to commit file to GitHub: ${putRes.statusText} - ${errText}`);
    }
  }
  return putRes.json();
}

export async function processArchitectureUpdateJob(job: Job) {
  const { pendingDecisionId } = job.data;

  const pending = await prisma.pendingDecision.findUnique({
    where: { id: pendingDecisionId },
    include: { repo: { include: { user: { include: { accounts: true } } } } }
  });

  if (!pending) throw new Error('Pending decision not found');
  if (pending.status !== 'pending') throw new Error(`Pending decision is already ${pending.status}`);

  const repo = pending.repo;
  const token = repo.user.github_access_token || repo.user.accounts.find(a => a.provider === 'github')?.access_token;
  if (!token) throw new Error('GitHub token missing');

  // 1. Generate Embedding
  const embedRes = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: `Title: ${pending.title}\nRationale: ${pending.rationale}`,
    encoding_format: 'float',
  });
  
  const embedding = embedRes.data[0].embedding;
  const newDecisionId = crypto.randomUUID();

  // 2. Claude - Update Architecture Markdown
  const archVersion = await prisma.architectureVersion.findFirst({
    where: { repo_id: repo.id },
    orderBy: { version: 'desc' }
  });

  let newArchContent = archVersion ? archVersion.content : '# Architecture\n\n';

  if (archVersion) {
    const systemPrompt = `You are an expert software architect. Given the current ARCHITECTURE.md and a newly approved architectural decision, update the ARCHITECTURE.md to incorporate this new decision. Return ONLY the raw markdown content without any XML tags or extra explanation.`;
    const userPrompt = `
<CURRENT_ARCHITECTURE>
${archVersion.content}
</CURRENT_ARCHITECTURE>

<NEW_DECISION>
Title: ${pending.title}
Description: ${pending.description}
Rationale: ${pending.rationale}
Suggested Markdown snippet: ${pending.suggested_markdown || 'None'}
</NEW_DECISION>

Please rewrite the ARCHITECTURE.md to seamlessly integrate this new decision.`;

    const msg = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 3000,
    });

    const responseText = msg.choices[0]?.message?.content || '';
    if (responseText) {
      newArchContent = responseText.trim();
    }
  }

  // 3. GitHub Push
  await pushToGitHub(
    repo.full_name,
    repo.user.github_access_token,
    'ARCHITECTURE.md',
    newArchContent,
    `docs: Update ARCHITECTURE.md based on PR #${pending.pr_number}`
  );

  // 4. Persistence
  await prisma.$transaction(async (tx) => {
    // Update pending
    await tx.pendingDecision.update({
      where: { id: pendingDecisionId },
      data: { status: 'approved' }
    });

    // Create decision
    await tx.$executeRaw`
      INSERT INTO decisions (id, repo_id, title, rationale, category, source, pr_url, pr_number, embedding, created_at, confirmed_by_user, confidence, approved_by)
      VALUES (
        ${newDecisionId},
        ${repo.id},
        ${pending.title},
        ${pending.rationale},
        'architecture'::"Category",
        'pr'::"Source",
        NULL,
        ${pending.pr_number},
        ${embedding}::vector,
        NOW(),
        true,
        ${pending.confidence},
        'system'
      )
    `;

    // Create new architecture version
    const newVersion = (archVersion?.version || 0) + 1;
    await tx.architectureVersion.create({
      data: {
        repo_id: repo.id,
        content: newArchContent,
        version: newVersion,
        committed_at: new Date()
      }
    });
  });

  // 5. Trigger Score Recalculation
  const { architectureScoreQueue } = await import('@devboard/shared/src/queue');
  await architectureScoreQueue.add('architecture-score', { repoId: repo.id });

  console.log(`Successfully approved pending decision ${pendingDecisionId} and updated ARCHITECTURE.md`);
}
