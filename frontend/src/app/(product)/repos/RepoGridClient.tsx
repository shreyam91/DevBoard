"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { FolderGit2, ArrowRight } from "lucide-react";
import toast from 'react-hot-toast';
import { ConnectButton } from "@/components/ConnectButton";
import { formatDistanceToNow } from 'date-fns';

export default function RepoGridClient({ initialRepos }: { initialRepos: any[] }) {
  const [repos, setRepos] = useState(initialRepos);

  useEffect(() => {
    const eventSource = new EventSource('/api/repos/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'repo_updated') {
          const updatedRepo = data.repo;
          setRepos(current => {
            const exists = current.find(r => r.id === updatedRepo.id);
            if (exists) {
              if (exists.last_commit_sha !== updatedRepo.last_commit_sha) {
                toast.success(`New commit pushed to ${updatedRepo.name}`);
              }
              return current.map(r => r.id === updatedRepo.id ? updatedRepo : r);
            }
            return [updatedRepo, ...current];
          });
        }
      } catch (e) {
        console.error("SSE parse error", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (repos.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
          <FolderGit2 className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-[20px] font-bold text-slate-900 mb-2">No repositories connected</h2>
        <p className="text-[14px] text-slate-500 max-w-sm mb-8 leading-relaxed">
          Connect a GitHub repository to start tracking architectural decisions automatically.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repos.map((repo) => (
        <Link 
          key={repo.id} 
          href={`/repos/${repo.id}`}
          className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all flex flex-col h-[180px]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-accent-blue group-hover:bg-accent-blue/5 transition-colors">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-slate-900 line-clamp-1" title={repo.full_name}>
                  {/* {repo.owner ? `${repo.owner}/` : ''} */}
                  {repo.name}
                </h2>
                {repo.last_activity_at && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Updated {formatDistanceToNow(new Date(repo.last_activity_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-[13px] text-slate-500 line-clamp-2 mb-auto leading-relaxed">
            {repo.last_commit_message ? (
              <span className="italic">&quot;{repo.last_commit_message}&quot;</span>
            ) : (
              <span>Architectural tracking active for {repo.name}</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
            <span className="text-[11px] font-medium text-slate-400">
              {repo.commit_count > 0 ? `${repo.commit_count} commits tracked` : `Connected ${new Date(repo.connected_at).toLocaleDateString()}`}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-accent-blue opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              View Architecture <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
