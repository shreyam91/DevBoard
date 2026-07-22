import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import ConflictsClient from './ConflictsClient';
import { Category } from '@/components/DecisionCard';

export default async function ConflictsPage({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  // AUTH BYPASS FOR UI DEVELOPMENT
  const conflicts: any[] = [];

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
