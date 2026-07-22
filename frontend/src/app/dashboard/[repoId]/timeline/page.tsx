import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import TimelineClient from './TimelineClient';

export default async function TimelinePage({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  // AUTH BYPASS FOR UI DEVELOPMENT
  const decisions: any[] = [];
  const conflicts: any[] = [];

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
