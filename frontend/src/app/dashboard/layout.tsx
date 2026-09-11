import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AppShell from '@/components/shell/AppShell';

/**
 * Product shell for the real authenticated flow (homepage → login → /dashboard → /dashboard/[repoId]).
 * Wraps both the "all repos" list and the repo-scoped workspace in the DevHub AppShell,
 * so the redesign shows on the routes the user actually lands on.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  return <AppShell>{children}</AppShell>;
}