import { AIReviewDashboard } from '@/components/architecture/AIReviewDashboard';

export const metadata = {
  title: 'AI Review | DevBoard',
};

export default function AIArchitectureReviewPage({
  params,
}: {
  params: { repoId: string };
}) {
  return (
    <div className="min-h-[70vh] w-full bg-slate-50 rounded-xl border border-[var(--border)]">
      <AIReviewDashboard repoId={params.repoId} />
    </div>
  );
}
