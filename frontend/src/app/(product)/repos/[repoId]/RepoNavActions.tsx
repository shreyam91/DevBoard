'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import SyncButton from './SyncButton';

/** Repo-scoped actions shown in the repo sub-nav row (kept off the page bodies). */
export default function RepoNavActions({ repoId }: { repoId: string }) {
  return (
    <div className="ml-auto flex shrink-0 items-center gap-2">
      <SyncButton repoId={repoId} />
      <Link
        href={`/repos/${repoId}/pending`}
        className="h-[36px] px-4 bg-slate-900 hover:bg-slate-800 shadow-sm rounded-lg flex items-center gap-2 transition-all group"
      >
        <Plus className="w-4 h-4 text-white" />
        <span className="text-[13px] font-semibold text-white">Log Decision</span>
      </Link>
    </div>
  );
}