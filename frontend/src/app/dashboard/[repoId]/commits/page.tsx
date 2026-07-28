'use client';

import React, { useEffect, useState } from 'react';
import { CommitExplorer } from '@/components/pr-explorer/CommitExplorer';
import { InteractiveDiffViewer } from '@/components/pr-explorer/InteractiveDiffViewer';
import { AlertCircle, GitCommit } from 'lucide-react';

export default function CommitsPage({ params }: { params: { repoId: string } }) {
  const [commits, setCommits] = useState<any[]>([]);
  const [diffFiles, setDiffFiles] = useState<any[]>([]);
  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(null);
  
  const [isLoadingCommits, setIsLoadingCommits] = useState(true);
  const [isLoadingDiff, setIsLoadingDiff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCommits() {
      try {
        setIsLoadingCommits(true);
        const res = await fetch(`/api/repos/${params.repoId}/commits`);
        if (!res.ok) throw new Error('Failed to load commits');
        const data = await res.json();
        setCommits(data);
        if (data.length > 0) {
          setSelectedCommitSha(data[0].sha);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingCommits(false);
      }
    }
    fetchCommits();
  }, [params.repoId]);

  useEffect(() => {
    async function fetchDiff() {
      if (!selectedCommitSha) {
        setDiffFiles([]);
        return;
      }
      try {
        setIsLoadingDiff(true);
        const res = await fetch(`/api/repos/${params.repoId}/commits/${selectedCommitSha}/diff`);
        if (!res.ok) throw new Error('Failed to load diff');
        const data = await res.json();
        setDiffFiles(data);
      } catch (err: any) {
        console.error('Error fetching diff:', err);
      } finally {
        setIsLoadingDiff(false);
      }
    }
    fetchDiff();
  }, [params.repoId, selectedCommitSha]);

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center h-full bg-white">
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex flex-col items-center gap-4 text-red-600 shadow-sm">
          <AlertCircle size={32} />
          <h2 className="text-lg font-medium">Error loading commits</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoadingCommits) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
      </div>
    );
  }

  const activeCommit = commits.find(c => c.sha === selectedCommitSha);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white">
      {/* Header */}
      <div className="flex flex-col gap-4 p-6 border-b border-slate-200 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
              <GitCommit className="text-accent-blue" /> Repository Commits
            </h1>
            {activeCommit && (
              <div className="flex items-center gap-3 mt-3 text-sm text-slate-500">
                <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                  {activeCommit.sha.substring(0, 7)}
                </span>
                <span>
                  <strong className="text-slate-700">{activeCommit.commit.author.name}</strong> authored
                </span>
                <span>•</span>
                <span className="truncate max-w-xl text-slate-700">{activeCommit.commit.message.split('\n')[0]}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <CommitExplorer 
          commits={commits} 
          selectedCommitSha={selectedCommitSha} 
          onSelectCommit={setSelectedCommitSha} 
          isPRView={false}
        />
        
        <InteractiveDiffViewer 
          files={diffFiles} 
          isLoading={isLoadingDiff} 
        />
      </div>
    </div>
  );
}
