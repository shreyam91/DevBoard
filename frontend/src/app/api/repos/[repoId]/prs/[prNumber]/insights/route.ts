import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@devboard/shared/src/prisma';
import OpenAI from 'openai';

export async function POST(
  request: NextRequest,
  { params }: { params: { repoId: string; prNumber: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId, prNumber } = params;
    
    const repo = await prisma.repo.findUnique({
      where: { id: repoId, user_id: session.user.id }
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const dbAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'github' },
      select: { access_token: true }
    });

    if (!dbAccount?.access_token) {
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 401 });
    }

    const token = dbAccount.access_token;
    const [owner, name] = repo.full_name.split('/');

    // Fetch PR Metadata
    const prRes = await fetch(`https://api.github.com/repos/${owner}/${name}/pulls/${prNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    const prData = await prRes.json();

    // Fetch PR Diff
    const diffRes = await fetch(`https://api.github.com/repos/${owner}/${name}/pulls/${prNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3.diff'
      }
    });
    const diffText = await diffRes.text();

    const ai = new OpenAI({ 
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPEN_AI_API || process.env.GEMINI_API_KEY 
    });
    
    const prompt = `
      You are an expert Principal Software Engineer. Please review the following Pull Request and provide your insights.
      
      PR Title: ${prData.title}
      PR Description: ${prData.body || 'No description provided.'}
      
      Diff:
      \`\`\`diff
      ${diffText.slice(0, 15000)} // Truncating diff to avoid massive payloads for this demo
      \`\`\`
      
      Provide a concise, professional markdown response with the following sections:
      ### 📝 Summary
      (1-2 sentences summarizing the core change)
      
      ### 🏗️ Architectural Impact
      (Note any changes to the architecture, new dependencies, or structural shifts)
      
      ### ⚠️ Potential Risks
      (Note any security risks, performance regressions, or breaking changes. If none, say "None identified".)
      
      Keep it brief and insightful.
    `;

    const response = await ai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return NextResponse.json({ insights: response.choices[0]?.message?.content || '' });
  } catch (error: any) {
    console.error('Error generating PR insights:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
