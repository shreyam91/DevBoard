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
    <div className="h-full w-full bg-slate-50 overflow-y-auto">
      <AIReviewDashboard repoId={params.repoId} />
    </div>
  );
}
