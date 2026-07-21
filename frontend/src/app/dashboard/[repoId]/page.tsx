import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import OverviewClient from './OverviewClient';

export default async function DashboardOverview({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  const rawDecisions = await prisma.decision.findMany({
    where: { repo_id: repoId },
    orderBy: { created_at: 'desc' },
    take: 5,
    include: {
      conflicts: {
        where: { resolved: false }
      }
    }
  });

  const decisions = rawDecisions.map(d => ({
    id: d.id,
    title: d.title,
    rationale: d.rationale,
    category: d.category,
    source: d.source,
    pr_url: d.pr_url,
    pr_number: d.pr_number,
    confirmed_by_user: d.confirmed_by_user,
    created_at: d.created_at.toISOString(),
    has_conflict: d.conflicts.length > 0
  }));

  const conflictsRaw = await prisma.conflict.findMany({
    where: { resolved: false, decision: { repo_id: repoId } },
    include: { decision: true },
    orderBy: { created_at: 'desc' }
  });

  const conflicts = conflictsRaw.map(c => ({
    id: c.id,
    decision_id: c.decision_id,
    decision_title: c.decision.title,
    pr_url: c.pr_url || '',
    pr_title: c.pr_title || 'Unknown PR',
    pr_number: c.pr_number || 0,
    description: c.description,
    resolved: c.resolved,
    created_at: c.created_at.toISOString()
  }));

  const total_decisions = await prisma.decision.count({ where: { repo_id: repoId } });
  
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  const decisions_this_month = await prisma.decision.count({
    where: {
      repo_id: repoId,
      created_at: { gte: firstDayOfMonth }
    }
  });

  const stats = {
    total_decisions,
    unresolved_conflicts: conflicts.length,
    prs_analyzed: 0,
    decisions_this_month
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-neutral-50">
      
      {/* Top bar (52px height) */}
      <div className="h-[52px] bg-white border-b border-[rgba(0,0,0,0.1)] flex items-center justify-between px-5 shrink-0">
        <h2 className="text-[14px] font-medium text-neutral-900">Overview</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-[6px] h-[6px] rounded-full bg-[#1D9E75]"></div>
            <span className="text-[12px] text-[rgba(0,0,0,0.45)]">Synced 1m ago</span>
          </div>
          <div className="w-[1px] h-4 bg-[rgba(0,0,0,0.1)]"></div>
          <button className="h-[28px] px-3 border border-[rgba(0,0,0,0.15)] rounded-md flex items-center gap-1.5 hover:bg-neutral-50 transition-colors">
            <i className="ti ti-plus text-[14px] text-neutral-600"></i>
            <span className="text-[12px] font-medium">Log decision</span>
          </button>
          <button className="h-[28px] px-3 bg-[#5551ff] rounded-md flex items-center gap-1.5 hover:bg-[#4a46e5] transition-colors">
            <i className="ti ti-file-code text-[14px] text-white"></i>
            <span className="text-[12px] font-medium text-white">ARCHITECTURE.md</span>
          </button>
        </div>
      </div>

      {/* Main scrollable area handled by Client Component for polling */}
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
