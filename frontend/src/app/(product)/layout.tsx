import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AppShell from '@/components/shell/AppShell';

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  return <AppShell>{children}</AppShell>;
}