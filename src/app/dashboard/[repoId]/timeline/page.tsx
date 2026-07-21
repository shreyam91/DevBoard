import React from 'react';
import { prisma } from '@/lib/prisma';
import TimelineClient from './TimelineClient';

export default async function TimelinePage({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  // Fetch decisions
  const rawDecisions = await prisma.decision.findMany({
    where: { repo_id: repoId },
    orderBy: { created_at: 'asc' }, // Chronological
    include: {
      conflicts: {
        where: { resolved: false },
        select: { id: true, pr_number: true }
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
    has_conflict: d.conflicts.length > 0,
    conflict_pr_number: d.conflicts[0]?.pr_number || undefined
  }));

  // Fetch conflicts to pass to the DetailPanel
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

  return (
    <div className="flex flex-col h-full overflow-hidden bg-neutral-50">
      {/* Top bar (52px height) */}
      <div className="h-[52px] bg-white border-b border-[rgba(0,0,0,0.1)] flex items-center justify-between px-5 shrink-0 z-10 relative">
        <h2 className="text-[14px] font-medium text-neutral-900">Decision timeline</h2>
        <div className="flex items-center gap-2">
          <button className="h-[28px] px-3 border border-[rgba(0,0,0,0.15)] rounded-md flex items-center gap-1.5 hover:bg-neutral-50 transition-colors">
            <i className="ti ti-download text-[14px] text-neutral-600"></i>
            <span className="text-[12px] font-medium text-neutral-900">Export ADR</span>
          </button>
          <button className="h-[28px] px-3 border border-[rgba(0,0,0,0.15)] rounded-md flex items-center gap-1.5 hover:bg-neutral-50 transition-colors">
            <i className="ti ti-filter text-[14px] text-neutral-600"></i>
            <span className="text-[12px] font-medium text-neutral-900">Filter</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <TimelineClient initialDecisions={decisions as any} initialConflicts={conflicts as any} />
      </div>
    </div>
  );
}
