import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import { auth } from '@/auth';
import OverviewClient from './OverviewClient';
import { Plus, FileCode, CheckCircle2 } from 'lucide-react';
import SyncButton from './SyncButton';

export default async function DashboardOverview({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  const session = await auth();
  
  const rawDecisions = await prisma.decision.findMany({
    where: { repo_id: repoId },
    orderBy: { created_at: 'desc' },
    take: 10
  });

  const decisions = rawDecisions.map(d => ({
    ...d,
    created_at: d.created_at.toISOString(),
    has_conflict: false
  }));

  const rawConflicts = await prisma.conflict.findMany({
    where: { repo_id: repoId, resolved: false },
    orderBy: { created_at: 'desc' }
  });

  const conflicts = rawConflicts.map(c => ({
    ...c,
    pr_url: c.pr_url || '',
    pr_title: c.pr_title || '',
    created_at: c.created_at.toISOString(),
    decision_title: 'Conflicting Decision'
  }));

  const total_decisions = await prisma.decision.count({ where: { repo_id: repoId } });
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const decisions_this_month = await prisma.decision.count({
    where: { repo_id: repoId, created_at: { gte: firstDayOfMonth } }
  });
  
  const pending_decisions = await prisma.pendingDecision.count({
    where: { repo_id: repoId, status: 'pending' }
  });

  const stats = {
    total_decisions,
    unresolved_conflicts: conflicts.length,
    prs_analyzed: 0,
    decisions_this_month,
    pending_decisions
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
          <SyncButton repoId={repoId} />
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
