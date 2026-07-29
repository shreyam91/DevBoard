import { ArchitectureGraph } from '@/components/architecture/ArchitectureGraph';

export const metadata = {
  title: 'Interactive Graph | DevBoard',
};

export default function ArchitectureVisualizationPage({
  params,
}: {
  params: { repoId: string };
}) {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] w-full">
      <ArchitectureGraph repoId={params.repoId} />
    </div>
  );
}
