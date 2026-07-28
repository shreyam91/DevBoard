import React from 'react';
import { format } from 'date-fns';
import { GitPullRequest, CheckCircle2, XCircle, GitMerge } from 'lucide-react';
import clsx from 'clsx';

interface PRHeaderProps {
  pr: any;
}

export function PRHeader({ pr }: PRHeaderProps) {
  if (!pr) return null;

  const isMerged = pr.merged_at !== null;
  const isClosed = pr.state === 'closed' && !isMerged;
  const isOpen = pr.state === 'open';

  return (
    <div className="flex flex-col gap-4 p-6 border-b border-slate-200 bg-white">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
            {pr.title} <span className="text-slate-500 font-normal">#{pr.number}</span>
          </h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-slate-500">
            <div className={clsx(
              "flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-xs",
              isOpen ? "bg-green-500/10 text-green-500 border border-green-500/20" : "",
              isMerged ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" : "",
              isClosed ? "bg-red-500/10 text-red-500 border border-red-500/20" : ""
            )}>
              {isOpen && <GitPullRequest size={14} />}
              {isMerged && <GitMerge size={14} />}
              {isClosed && <XCircle size={14} />}
              {isOpen ? 'Open' : isMerged ? 'Merged' : 'Closed'}
            </div>
            
            <span>
              <strong className="text-slate-700">{pr.user.login}</strong> wants to merge {pr.commits} commits into <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">{pr.base.ref}</code> from <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">{pr.head.ref}</code>
            </span>
            <span>•</span>
            <span>Created {format(new Date(pr.created_at), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
