import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGithubToken } from '@devboard/shared/src/utils/auth';
import { prisma } from '@devboard/shared/src/prisma';

export async function DELETE(
  req: NextRequest,
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

    // Delete related records first (if Cascade delete isn't setup perfectly)
    await prisma.decision.deleteMany({ where: { repo_id: repo.id } });
    await prisma.pendingDecision.deleteMany({ where: { repo_id: repo.id } });
    await prisma.conflict.deleteMany({ where: { repo_id: repo.id } });
    await prisma.architectureVersion.deleteMany({ where: { repo_id: repo.id } });
    await prisma.repositoryMetadata.deleteMany({ where: { repo_id: repo.id } });
    await prisma.questionnaire.deleteMany({ where: { repo_id: repo.id } });
    await prisma.initializationJob.deleteMany({ where: { repo_id: repo.id } });
    await prisma.analysisJob.deleteMany({ where: { repo_id: repo.id } });
    await prisma.webhookEvent.deleteMany({ where: { repo_id: repo.id } });
    await prisma.pullRequest.deleteMany({ where: { repo_id: repo.id } });

    // Finally delete repo
    await prisma.repo.delete({
      where: { id: repo.id }
    });

    return NextResponse.json({ success: true, message: 'Repository deleted' });
  } catch (error) {
    console.error('Error deleting repo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
