import { clerkClient } from '@clerk/nextjs/server';

export async function getGithubToken(userId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const tokenRes = await client.users.getUserOauthAccessToken(userId, 'oauth_github');
    return tokenRes.data[0]?.token || null;
  } catch (error) {
    console.error('Failed to get GitHub token from Clerk:', error);
    return null;
  }
}
