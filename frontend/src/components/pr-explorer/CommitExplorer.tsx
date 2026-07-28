import React from 'react';
import { format } from 'date-fns';
import { GitCommit, Search } from 'lucide-react';
import clsx from 'clsx';

interface CommitExplorerProps {
  commits: any[];
  selectedCommitSha: string | null;
  onSelectCommit: (sha: string | null) => void;
  isPRView?: boolean;
}

export function CommitExplorer({ commits, selectedCommitSha, onSelectCommit, isPRView = true }: CommitExplorerProps) {
  return (
    <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-slate-50/50 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Commits</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search commits..."
            className="w-full bg-slate-100 border border-slate-200 rounded-md py-1.5 pl-8 pr-3 text-sm text-slate-700 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue placeholder-slate-400"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-white">
        {isPRView && (
          <button
            onClick={() => onSelectCommit(null)}
            className={clsx(
              "w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors",
              selectedCommitSha === null ? "bg-slate-50 border-l-2 border-l-accent-blue" : "border-l-2 border-l-transparent"
            )}
          >
            <div className="font-medium text-sm text-slate-800">Entire Pull Request</div>
            <div className="text-xs text-slate-500 mt-1">Showing all changes</div>
          </button>
        )}
        
        {commits.map((commit: any) => (
          <button
            key={commit.sha}
            onClick={() => onSelectCommit(commit.sha)}
            className={clsx(
              "w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors group",
              selectedCommitSha === commit.sha ? "bg-slate-50 border-l-2 border-l-accent-blue" : "border-l-2 border-l-transparent"
            )}
          >
            <div className="flex items-start gap-2">
              <GitCommit size={14} className="mt-0.5 text-slate-400 group-hover:text-slate-500" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-700 font-medium truncate" title={commit.commit.message}>
                  {commit.commit.message.split('\n')[0]}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="truncate">{commit.commit.author.name}</span>
                  <span>•</span>
                  <span>{format(new Date(commit.commit.author.date), 'MMM d')}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
