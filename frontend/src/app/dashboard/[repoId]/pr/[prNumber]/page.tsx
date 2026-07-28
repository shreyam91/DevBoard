'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PRHeader } from '@/components/pr-explorer/PRHeader';
import { CommitExplorer } from '@/components/pr-explorer/CommitExplorer';
import { InteractiveDiffViewer } from '@/components/pr-explorer/InteractiveDiffViewer';
import { AIInsightsPanel } from '@/components/pr-explorer/AIInsightsPanel';
import { AlertCircle } from 'lucide-react';

export default function PRPage({ params }: { params: { repoId: string; prNumber: string } }) {
  const [prData, setPrData] = useState<any>(null);
  const [commits, setCommits] = useState<any[]>([]);
  const [diffFiles, setDiffFiles] = useState<any[]>([]);
  
  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(null);
  
  const [isLoadingPR, setIsLoadingPR] = useState(true);
  const [isLoadingDiff, setIsLoadingDiff] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPRBaseData() {
      try {
        setIsLoadingPR(true);
        const [prRes, commitsRes] = await Promise.all([
          fetch(`/api/repos/${params.repoId}/prs/${params.prNumber}`),
          fetch(`/api/repos/${params.repoId}/prs/${params.prNumber}/commits`)
        ]);

        if (!prRes.ok) throw new Error('Failed to load PR metadata');
        if (!commitsRes.ok) throw new Error('Failed to load Commits');

        const [prJson, commitsJson] = await Promise.all([prRes.json(), commitsRes.json()]);
        setPrData(prJson);
        setCommits(commitsJson);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingPR(false);
      }
    }
    fetchPRBaseData();
  }, [params.repoId, params.prNumber]);

  useEffect(() => {
    async function fetchDiff() {
      try {
        setIsLoadingDiff(true);
        let url = `/api/repos/${params.repoId}/prs/${params.prNumber}/diff`;
        if (selectedCommitSha) {
          url += `?commit_sha=${selectedCommitSha}`;
        }
        const diffRes = await fetch(url);
        if (!diffRes.ok) throw new Error('Failed to load diffs');
        
        const diffJson = await diffRes.json();
        setDiffFiles(diffJson);
      } catch (err: any) {
        console.error('Error fetching diff:', err);
      } finally {
        setIsLoadingDiff(false);
      }
    }
    fetchDiff();
  }, [params.repoId, params.prNumber, selectedCommitSha]);

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex flex-col items-center gap-4 text-red-600 shadow-sm">
          <AlertCircle size={32} />
          <h2 className="text-lg font-medium">Error loading Pull Request</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoadingPR) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white">
      <PRHeader pr={prData} />
      
      <div className="flex flex-1 overflow-hidden">
        <CommitExplorer 
          commits={commits} 
          selectedCommitSha={selectedCommitSha} 
          onSelectCommit={setSelectedCommitSha} 
        />
        
        <InteractiveDiffViewer 
          files={diffFiles} 
          isLoading={isLoadingDiff} 
        />
        
        <AIInsightsPanel 
          repoId={params.repoId} 
          prNumber={params.prNumber} 
        />
      </div>
    </div>
  );
}
