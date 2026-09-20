import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import ConflictsClient from './ConflictsClient';
import { Category } from '@/components/DecisionCard';

export default async function ConflictsPage({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  // AUTH BYPASS FOR UI DEVELOPMENT
  const conflicts: any[] = [];

  return (
    <div className="flex flex-col gap-4">

      {/* Conflicts table */}
      <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center bg-[var(--surface-subtle)] border-b border-[var(--border)] h-[44px] px-4">
          <div className="flex-[2] text-[11px] uppercase tracking-wider font-medium text-[var(--text-faint)]">Pull Request</div>
          <div className="flex-[2] text-[11px] uppercase tracking-wider font-medium text-[var(--text-faint)]">Conflicts With</div>
          <div className="flex-[1] text-[11px] uppercase tracking-wider font-medium text-[var(--text-faint)]">Date Detected</div>
          <div className="w-[100px]"></div>
        </div>

        {/* Table Body */}
        {conflicts.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-[var(--text-muted)]">
            No active conflicts. You&apos;re all clear!
          </div>
        ) : (
          <ConflictsClient initialConflicts={conflicts} />
        )}
      </div>
    </div>
  );
}
