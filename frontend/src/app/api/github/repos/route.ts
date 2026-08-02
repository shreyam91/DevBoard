import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGithubToken } from '@devboard/shared/src/utils/auth';
import { prisma } from '@devboard/shared/src/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getGithubToken(userId);
    if (!token) {
      return NextResponse.json({ error: 'GitHub account not linked or missing access token' }, { status: 400 });
    }

    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        Authorization: `Bearer ${token}`,
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
