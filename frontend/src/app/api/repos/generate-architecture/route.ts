import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGithubToken } from '@devboard/shared/src/utils/auth';
import { prisma } from '@devboard/shared/src/prisma';
import { executeArchitecturePipeline } from '@devboard/shared/src/llm/saveArchitecturePipeline';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId, answers } = await req.json();

    if (!repoId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership and get repo full_name
    const repo = await prisma.repo.findFirst({
      where: {
        id: repoId,
        user_id: userId
      }
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const github_access_token = await getGithubToken(userId);

    if (!github_access_token) {
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 403 });
    }

    let contextData: any = answers;
    let source: 'questionnaire' | 'archaeology' = 'questionnaire';

    if (!repo.is_new_repo) {
      const metadata = await prisma.repositoryMetadata.findUnique({
        where: { repo_id: repoId }
      });
      const q = await prisma.questionnaire.findUnique({
        where: { repo_id: repoId }
      });
      
      source = 'archaeology';
      contextData = {
        archaeology_context: metadata ? {
          detected_languages: metadata.detected_languages,
          detected_frameworks: metadata.detected_frameworks,
          detected_infra: metadata.detected_infra,
          commit_history_summary: {
            first_commit_date: metadata.first_commit_date,
            last_commit_date: metadata.last_commit_date,
            total_commits_sample: metadata.total_commits,
            recent_messages: []
          },
          readme_summary: metadata.readme_summary
        } : {},
        user_questionnaire_answers: (answers && Object.keys(answers).length > 0) ? answers : (q?.answers || {})
      };
    }

    await executeArchitecturePipeline(
      repo.id,
      repo.full_name,
      github_access_token,
      {
        source,
        data: contextData,
      }
    );

    return NextResponse.json({ success: true, redirect: `/dashboard/${repoId}` });
  } catch (error: any) {
    console.error('Error generating architecture:', error);
    const errorMessage = error?.message || 'Unknown error';
    const errorMeta = error?.meta || {};
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage, meta: errorMeta }, { status: 500 });
  }
}
