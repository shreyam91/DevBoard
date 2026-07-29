import { Metadata } from 'next';
import SemanticSearchClient from './SemanticSearchClient';

export const metadata: Metadata = {
  title: 'Semantic Search | DevBoard',
};

export default function SearchPage({
  params,
}: {
  params: { repoId: string };
}) {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] w-full overflow-hidden bg-white">
      <SemanticSearchClient repoId={params.repoId} />
    </div>
  );
}
