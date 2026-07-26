import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@devboard/shared/src/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github',
      },
      select: {
        access_token: true,
      }
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: 'GitHub account not linked or missing access token' }, { status: 400 });
    }

    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch from GitHub API:', response.status, await response.text());
      return NextResponse.json({ error: 'Failed to fetch repositories from GitHub' }, { status: 502 });
    }

    const repos = await response.json();
    return NextResponse.json({ repos });
  } catch (error) {
    console.error('Error fetching github repos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
