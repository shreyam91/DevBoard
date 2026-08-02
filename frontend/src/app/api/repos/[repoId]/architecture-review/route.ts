import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGithubToken } from '@devboard/shared/src/utils/auth';
import { prisma } from '@devboard/shared/src/prisma';
import OpenAI from 'openai';

export const maxDuration = 60; // Allow more time for AI processing

const responseSchema = {
  type: "json_schema",
  json_schema: {
    name: "architecture_review",
    schema: {
      type: "object",
      properties: {
        healthScore: { type: "integer", description: "0-100 score of architecture health" },
        architectureSummary: { type: "string" },
        bottlenecks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              problem: { type: "string" },
              impact: { type: "string" },
              recommendation: { type: "string" }
            },
            required: ["problem", "impact", "recommendation"]
          }
        },
        suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              reason: { type: "string" },
              expectedBenefit: { type: "string" },
              estimatedImpact: { type: "string" },
              difficulty: { type: "string" }
            },
            required: ["title", "reason", "expectedBenefit", "estimatedImpact", "difficulty"]
          }
        },
        techDebt: {
          type: "array",
          items: { type: "string" }
        },
        deadCode: {
          type: "array",
          items: { type: "string" }
        },
        performanceWarnings: {
          type: "array",
          items: { type: "string" }
        },
        securityWarnings: {
          type: "array",
          items: { type: "string" }
        },
        refactoringPriorities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              module: { type: "string" },
              reason: { type: "string" },
              complexity: { type: "string" },
              dependencyCount: { type: "integer" },
              estimatedMaintenanceBenefit: { type: "string" }
            },
            required: ["module", "reason", "complexity", "dependencyCount", "estimatedMaintenanceBenefit"]
          }
        },
        aiSummary: {
          type: "object",
          properties: {
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            immediateFixes: { type: "array", items: { type: "string" } },
            longTermImprovements: { type: "array", items: { type: "string" } },
            overallQuality: { type: "string" }
          },
          required: ["strengths", "weaknesses", "immediateFixes", "longTermImprovements", "overallQuality"]
        }
      },
      required: [
        "healthScore", 
        "architectureSummary", 
        "bottlenecks", 
        "suggestions", 
        "techDebt", 
        "deadCode", 
        "performanceWarnings", 
        "securityWarnings", 
        "refactoringPriorities", 
        "aiSummary"
      ],
      additionalProperties: false
    }
  }
};

export async function POST(
  request: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId } = params;

    const repo = await prisma.repo.findUnique({
      where: { id: repoId, user_id: userId }
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const analysis = await prisma.architectureAnalysis.findFirst({
      where: { repo_id: repoId },
      orderBy: { analyzed_at: 'desc' }
    });

    if (!analysis || !analysis.graph_data) {
      return NextResponse.json({ error: 'No architecture graph found. Run graph analysis first.' }, { status: 400 });
    }

    // Initialize OpenAI / OpenRouter
    const ai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPEN_AI_API || process.env.GEMINI_API_KEY,
    });
    
    // We send a summarized version of the graph to avoid blowing up the context window
    const graphData: any = analysis.graph_data;
    const graphSummary = {
      totalNodes: graphData.nodes?.length,
      totalEdges: graphData.edges?.length,
      stats: analysis.stats,
      nodes: graphData.nodes?.map((n: any) => ({ id: n.id, type: n.type })).slice(0, 300), // Limit to top 300 nodes for context
      edges: graphData.edges?.slice(0, 500) // Limit edges
    };

    const prompt = `
      You are an expert Principal Software Architect analyzing a software repository's dependency graph.
      
      Repository Name: ${repo.full_name}
      
      I have extracted the dependency graph (nodes and edges representing files/modules and their imports/exports) and basic statistics. 
      Analyze the provided graph structure and provide a comprehensive architecture review.
      
      Graph Data:
      ${JSON.stringify(graphSummary, null, 2)}
      
      Please provide an in-depth architecture review following the structured JSON schema. Detect potential god classes, circular dependencies, modularity issues, and suggest refactoring priorities.
    `;

    const response = await ai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: responseSchema as any
    });

    const aiReviewData = JSON.parse(response.choices[0]?.message?.content || '{}');

    // Save the review back to the database
    const updatedAnalysis = await prisma.architectureAnalysis.update({
      where: { id: analysis.id },
      data: {
        ai_review: aiReviewData,
        health_score: aiReviewData.healthScore
      }
    });

    return NextResponse.json(updatedAnalysis);
  } catch (error: any) {
    console.error('Error generating AI review:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
