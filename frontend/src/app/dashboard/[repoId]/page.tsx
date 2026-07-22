import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import OverviewClient from './OverviewClient';
import { Plus, FileCode, CheckCircle2 } from 'lucide-react';

export default async function DashboardOverview({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  // AUTH BYPASS FOR UI DEVELOPMENT - Mocking Data
  const decisions: any[] = [];
  const conflicts: any[] = [];
  const total_decisions = 0;
  const decisions_this_month = 0;

  const stats = {
    total_decisions,
    unresolved_conflicts: conflicts.length,
    prs_analyzed: 0,
    decisions_this_month
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      
      {/* Top bar */}
      <header className="h-[64px] bg-white/60 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">Overview</h2>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[13px] font-medium text-slate-500">Synced just now</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-[36px] px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm rounded-lg flex items-center gap-2 transition-all">
            <Plus className="w-4 h-4 text-slate-500" />
            <span className="text-[13px] font-semibold text-slate-700">Log Decision</span>
          </button>
          <button className="h-[36px] px-4 bg-accent-blue hover:bg-accent-blue/90 shadow-sm rounded-lg flex items-center gap-2 transition-all group">
            <FileCode className="w-4 h-4 text-white/90 group-hover:text-white" />
            <span className="text-[13px] font-semibold text-white">ARCHITECTURE.md</span>
          </button>
        </div>
      </header>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto">
        <OverviewClient 
          initialDecisions={decisions} 
          initialConflicts={conflicts} 
          initialStats={stats} 
          repoId={repoId}
        />
      </div>

    </div>
  );
}
