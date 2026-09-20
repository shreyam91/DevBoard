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
    <div className="h-[70vh] w-full">
      <ArchitectureGraph repoId={params.repoId} />
    </div>
  );
}
