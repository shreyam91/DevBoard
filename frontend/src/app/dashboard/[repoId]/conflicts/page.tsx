import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import ConflictsClient from './ConflictsClient';
import { Category } from '@/components/DecisionCard';

export default async function ConflictsPage({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  const conflictsRaw = await prisma.conflict.findMany({
    where: { resolved: false, decision: { repo_id: repoId } },
    include: { decision: true },
    orderBy: { created_at: 'desc' }
  });

  const conflicts = conflictsRaw.map(c => ({
    id: c.id,
    decision_id: c.decision_id,
    decision_title: c.decision.title,
    decision_category: c.decision.category as Category,
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
      <div className="h-[52px] bg-white border-b border-[rgba(0,0,0,0.1)] flex items-center justify-between px-5 shrink-0">
        <h2 className="text-[14px] font-medium text-neutral-900">Conflicts</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-[1000px]">
          
          <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[9px] overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center bg-[#f9fafb] border-b border-[rgba(0,0,0,0.1)] h-[32px] px-4">
              <div className="flex-[2] text-[11px] uppercase tracking-wider font-medium text-[rgba(0,0,0,0.45)]">Pull Request</div>
              <div className="flex-[2] text-[11px] uppercase tracking-wider font-medium text-[rgba(0,0,0,0.45)]">Conflicts With</div>
              <div className="flex-[1] text-[11px] uppercase tracking-wider font-medium text-[rgba(0,0,0,0.45)]">Date Detected</div>
              <div className="w-[100px]"></div>
            </div>

            {/* Table Body */}
            {conflicts.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[rgba(0,0,0,0.45)]">
                No active conflicts. You&apos;re all clear!
              </div>
            ) : (
              <ConflictsClient initialConflicts={conflicts} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
