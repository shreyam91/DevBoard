import { Job } from 'bullmq';
import { prisma } from '@devboard/shared/src/prisma';
import OpenAI from 'openai';

interface ScoreJobData {
  repoId: string;
}

export async function processScoreCalculationJob(job: Job<ScoreJobData>) {
  const { repoId } = job.data;
  console.log(`[ScoreWorker] Calculating architecture score for repo ${repoId}`);

  try {
    const repo = await prisma.repo.findUnique({
      where: { id: repoId }
    });

    if (!repo) {
      throw new Error(`Repo ${repoId} not found`);
    }

    // 1. Decision Compliance (35%)
    // How many merged PRs follow existing decisions vs have unresolved conflicts?
    const totalPrs = await prisma.pullRequest.count({
      where: { repo_id: repoId }
    });
    
    const prsWithConflicts = await prisma.conflict.findMany({
      where: { repo_id: repoId },
      select: { pr_number: true },
      distinct: ['pr_number']
    });

    let decisionCompliance = 100;
    if (totalPrs > 0) {
      const problematicPrs = prsWithConflicts.length;
      decisionCompliance = Math.max(0, 100 - ((problematicPrs / totalPrs) * 100));
    } else if (prsWithConflicts.length > 0) {
      decisionCompliance = 0; // Conflicts without logged PRs? Edge case.
    }

    // 2. Documentation Freshness (25%)
    // How recently was ARCHITECTURE.md updated compared to latest decision?
    const latestDecision = await prisma.decision.findFirst({
      where: { repo_id: repoId },
      orderBy: { created_at: 'desc' }
    });

    const latestArch = await prisma.architectureVersion.findFirst({
      where: { repo_id: repoId },
      orderBy: { committed_at: 'desc' }
    });

    let docFreshness = 100;
    if (latestDecision && latestArch) {
      const decisionTime = latestDecision.created_at.getTime();
      const archTime = latestArch.committed_at.getTime();
      if (decisionTime > archTime) {
        const daysStale = (decisionTime - archTime) / (1000 * 60 * 60 * 24);
        docFreshness = Math.max(0, 100 - (daysStale * 10)); // Lose 10 points per day stale
      }
    } else if (latestDecision && !latestArch) {
      docFreshness = 0; // Decisions exist but no documentation generated yet
    }

    // 3. Decision Coverage (15%)
    // Approximation based on detected frameworks vs decisions
    const metadata = await prisma.repositoryMetadata.findUnique({
      where: { repo_id: repoId }
    });
    const totalDecisions = await prisma.decision.count({
      where: { repo_id: repoId }
    });
    
    let docCoverage = 50; // Default middle ground
    if (metadata?.detected_frameworks) {
      // Basic heuristic: expect ~3 decisions per framework/tool
      const frameworkCount = Object.keys(metadata.detected_frameworks).length || 1;
      const expectedDecisions = Math.max(5, frameworkCount * 3);
      docCoverage = Math.min(100, (totalDecisions / expectedDecisions) * 100);
    }

    // 4. Open Conflicts (15%)
    // Deduct points for unresolved conflicts
    const openConflicts = await prisma.conflict.count({
      where: { repo_id: repoId, resolved: false }
    });
    const openConflictsScore = Math.max(0, 100 - (openConflicts * 15)); // Lose 15 points per open conflict

    // 5. AI Confidence (10%)
    // Average confidence of decisions
    const decisions = await prisma.decision.findMany({
      where: { repo_id: repoId, confidence: { not: null } },
      select: { confidence: true }
    });
    
    let aiConfidenceScore = 100;
    if (decisions.length > 0) {
      const sum = decisions.reduce((acc, val) => acc + (val.confidence || 0), 0);
      aiConfidenceScore = (sum / decisions.length) * 100; // Assuming confidence is 0-1
    }

    // Weighted Total Score
    const finalScore = Math.round(
      (decisionCompliance * 0.35) +
      (docFreshness * 0.25) +
      (docCoverage * 0.15) +
      (openConflictsScore * 0.15) +
      (aiConfidenceScore * 0.10)
    );

    // AI Insights Generation
    const prompt = `You are DevBoard's Architecture Intelligence. 
Analyze the following architectural health scores for a GitHub repository and provide 2-3 actionable insights (short sentences) for the developers to improve their score.

Metrics:
- Overall Score: ${finalScore}/100
- Decision Compliance: ${decisionCompliance.toFixed(1)}% (Percentage of PRs following existing decisions)
- Documentation Freshness: ${docFreshness.toFixed(1)}% (Recentness of ARCHITECTURE.md updates)
- Decision Coverage: ${docCoverage.toFixed(1)}% (Approximate coverage of decisions across the system)
- Open Conflicts: ${openConflicts} unresolved architecture conflicts
- AI Confidence: ${aiConfidenceScore.toFixed(1)}% (Confidence in the detected decisions)

Return ONLY a JSON array of strings, for example: ["Consider documenting recent authentication changes.", "Two unresolved conflicts are reducing your score."]`;

    let insights: string[] = [];
    try {
      const openai = new OpenAI({ 
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPEN_AI_API || process.env.OPENAI_API_KEY 
      });
      const response = await openai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      });
      // @ts-ignore
      const text = response.choices[0].message.content;
      const parsed = JSON.parse(text.substring(text.indexOf('['), text.lastIndexOf(']') + 1));
      if (Array.isArray(parsed)) {
        insights = parsed;
      }
    } catch (err) {
      console.error(`[ScoreWorker] Failed to generate AI insights:`, err);
      insights = ["Keep maintaining your architecture documentation."];
    }

    const savedScore = await prisma.architectureScore.create({
      data: {
        repo_id: repoId,
        score: finalScore,
        decision_compliance: decisionCompliance,
        documentation_freshness: docFreshness,
        decision_coverage: docCoverage,
        open_conflicts_score: openConflictsScore,
        ai_confidence: aiConfidenceScore,
        insights: insights,
      }
    });

    console.log(`[ScoreWorker] Completed for repo ${repoId}. Score: ${finalScore}`);
    return savedScore;
  } catch (error) {
    console.error(`[ScoreWorker] Error calculating score:`, error);
    throw error;
  }
}
