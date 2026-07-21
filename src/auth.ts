import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [GitHub],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, profile, account }) {
      if (account && profile) {
        if (account.provider === 'github' && profile.id) {
          const githubId = profile.id.toString();
          
          const dbUser = await prisma.user.upsert({
            where: { github_id: githubId },
            update: {
              name: (profile.name as string) || undefined,
              email: (profile.email as string) || undefined,
              avatar_url: (profile.avatar_url as string) || undefined,
              github_access_token: account.access_token || undefined,
            },
            create: {
              github_id: githubId,
              name: (profile.name as string) || undefined,
              email: (profile.email as string) || undefined,
              avatar_url: (profile.avatar_url as string) || undefined,
              github_access_token: account.access_token || undefined,
            },
          });
          
          token.sub = dbUser.id;
        }
      }
      return token;
    },
  },
});
