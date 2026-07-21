'use client';

import React, { useState, useEffect } from 'react';
import DecisionCard from '@/components/DecisionCard';
import DecisionDetailPanel from '@/components/DecisionDetailPanel';

import { FullDecision, FullConflict } from '@/components/DecisionDetailPanel';

interface Props {
  initialDecisions: FullDecision[];
  initialConflicts: FullConflict[];
  initialStats: {
    total_decisions: number;
    unresolved_conflicts: number;
    prs_analyzed: number;
    decisions_this_month: number;
  };
  repoId: string;
}

export default function OverviewClient({ initialDecisions, initialConflicts, initialStats, repoId }: Props) {
  const [decisions, setDecisions] = useState(initialDecisions);
  const [conflicts, setConflicts] = useState(initialConflicts);
  const [stats, setStats] = useState(initialStats);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  // Poll /pending every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/repos/${repoId}/pending`);
        if (res.ok) {
          const { active_conflicts } = await res.json();
          // If there's a discrepancy, trigger full refresh of overview
          if (active_conflicts !== stats.unresolved_conflicts) {
            const overviewRes = await fetch(`/api/repos/${repoId}/overview`);
            if (overviewRes.ok) {
              const data = await overviewRes.json();
              setDecisions(data.decisions);
              setConflicts(data.conflicts);
              setStats(data.stats);
            }
          }
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [repoId, stats.unresolved_conflicts]);

  const latestConflict = conflicts[0];
  const selectedDecision = decisions.find(d => d.id === selectedDecisionId) || null;

  return (
    <>
      <div className="flex relative">
        <div className="flex-1 max-w-[900px]">
          
          {/* Conflict Banner */}
          {latestConflict && (
            <div className="mt-[14px] mx-[20px] bg-[#FCEBEB] border border-[#F09595] rounded-[9px] p-[11px] px-[14px] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <i className="ti ti-alert-triangle text-[#A32D2D] text-[15px]"></i>
                <span className="text-[13px] text-[#791F1F]">
                  PR #{latestConflict.pr_number} conflicts with your <span className="font-medium">&apos;{latestConflict.decision_title}&apos;</span> decision. This needs your attention before merging.
                </span>
              </div>
              <a href={`/dashboard/${repoId}/conflicts`} className="text-[13px] text-[#A32D2D] underline font-medium whitespace-nowrap ml-4 hover:opacity-80">
                Review &rarr;
              </a>
            </div>
          )}

          <div className="p-5">
            {/* Metric cards */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 bg-white border border-[rgba(0,0,0,0.1)] rounded-[9px] p-3 px-[14px]">
                <div className="text-[11px] text-[rgba(0,0,0,0.45)] mb-[5px] uppercase tracking-wider font-medium">Decisions Logged</div>
                <div className="text-[26px] font-medium leading-none text-neutral-900">{stats.total_decisions}</div>
                <div className="text-[11px] text-[#0F6E56] mt-[3px] font-medium">+{stats.decisions_this_month} this month</div>
              </div>
              
              <div className="flex-1 bg-white border border-[rgba(0,0,0,0.1)] rounded-[9px] p-3 px-[14px]">
                <div className="text-[11px] text-[rgba(0,0,0,0.45)] mb-[5px] uppercase tracking-wider font-medium">Active Conflicts</div>
                <div className="text-[26px] font-medium leading-none text-[#A32D2D]">{stats.unresolved_conflicts}</div>
                <div className="text-[11px] text-[rgba(0,0,0,0.45)] mt-[3px]">Requires resolution</div>
              </div>
              
              <div className="flex-1 bg-white border border-[rgba(0,0,0,0.1)] rounded-[9px] p-3 px-[14px]">
                <div className="text-[11px] text-[rgba(0,0,0,0.45)] mb-[5px] uppercase tracking-wider font-medium">PRs Analyzed</div>
                <div className="text-[26px] font-medium leading-none text-neutral-900">{stats.prs_analyzed}</div>
                <div className="text-[11px] text-[#0F6E56] mt-[3px] font-medium">+0 this week</div>
              </div>
            </div>

            {/* Decisions List */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[14px] font-medium text-neutral-900">Recent Decisions</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              {decisions.map(decision => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  onClick={() => setSelectedDecisionId(decision.id)}
                  onConfirm={async () => {
                    const res = await fetch(`/api/decisions/${decision.id}/confirm`, { method: 'PATCH' });
                    if (res.ok) {
                      setDecisions(prev => prev.map(d => d.id === decision.id ? { ...d, confirmed_by_user: true } : d));
                    }
                  }}
                />
              ))}
              {decisions.length === 0 && (
                <div className="py-12 text-center text-[rgba(0,0,0,0.45)] border border-dashed border-[rgba(0,0,0,0.1)] rounded-[9px]">
                  No decisions logged yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Slide in panel overlay */}
        {selectedDecision && (
          <DecisionDetailPanel
            decision={selectedDecision}
            conflict={conflicts.find(c => c.decision_id === selectedDecision.id)}
            onClose={() => setSelectedDecisionId(null)}
            onResolve={async () => {
              const c = conflicts.find(x => x.decision_id === selectedDecision.id);
              if (c) {
                const res = await fetch(`/api/conflicts/${c.id}/resolve`, { method: 'PATCH' });
                if (res.ok) {
                  setConflicts(prev => prev.filter(x => x.id !== c.id));
                  setStats(s => ({ ...s, unresolved_conflicts: s.unresolved_conflicts - 1 }));
                }
              }
            }}
          />
        )}
      </div>
    </>
  );
}
