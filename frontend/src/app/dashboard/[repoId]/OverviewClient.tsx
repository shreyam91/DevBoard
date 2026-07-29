'use client';

import React, { useState, useEffect } from 'react';
import DecisionCard from '@/components/DecisionCard';
import DecisionDetailPanel from '@/components/DecisionDetailPanel';
import { AlertTriangle, FileCode, CheckCircle2, Search, X } from 'lucide-react';
import { FullDecision, FullConflict } from '@/components/DecisionDetailPanel';
import ScoreWidget from '@/components/ScoreWidget';

interface Props {
  initialDecisions: FullDecision[];
  initialConflicts: FullConflict[];
  initialStats: {
    total_decisions: number;
    unresolved_conflicts: number;
    pending_decisions: number;
    decisions_this_month: number;
  };
  repoId: string;
}

export default function OverviewClient({ initialDecisions, initialConflicts, initialStats, repoId }: Props) {
  const [decisions, setDecisions] = useState(initialDecisions);
  const [conflicts, setConflicts] = useState(initialConflicts);
  const [stats, setStats] = useState(initialStats);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  // Search State
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      try {
        const res = await fetch(`/api/repos/${repoId}/simple-search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, repoId]);

  // Poll /pending every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/repos/${repoId}/pending`);
        if (res.ok) {
          const { active_conflicts, unconfirmed_decisions } = await res.json();
          // If there's a discrepancy, trigger full refresh of overview
          if (active_conflicts !== stats.unresolved_conflicts || unconfirmed_decisions !== stats.pending_decisions) {
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
  }, [repoId, stats.unresolved_conflicts, stats.pending_decisions]);

  const latestConflict = conflicts[0];
  const selectedDecision = decisions.find(d => d.id === selectedDecisionId) || null;

  return (
    <>
      <div className="flex relative">
        <div className="flex-1 max-w-[1000px] mx-auto p-6 md:p-8">
          
          <ScoreWidget repoId={repoId} />

          {/* Search Bar */}
          <div className="mb-8 relative">
            <div className="relative flex items-center group">
              <Search className="absolute left-4 text-slate-400 group-focus-within:text-accent-blue transition-colors" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search PRs, Commits, Decisions, and Conflicts..."
                className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="absolute right-4 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            {/* Search Results Dropdown/Overlay */}
            {query.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {isSearching ? (
                  <div className="p-6 text-center text-slate-500 text-sm">Searching repository data...</div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto">
                    {searchResults.map((res, i) => (
                      <div key={`${res.id}-${i}`} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                                {res.type.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(res.date).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">{res.title}</h4>
                            <p className="text-xs text-slate-600 line-clamp-2">{res.description}</p>
                          </div>
                          {res.url && (
                            <a href={res.url} target="_blank" rel="noreferrer" className="shrink-0 text-xs text-accent-blue hover:underline bg-accent-blue/10 px-3 py-1.5 rounded-lg font-medium mt-1">
                              View Link
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-sm">No results found for &quot;{query}&quot;</div>
                )}
              </div>
            )}
          </div>

          {/* Conflict Banner */}
          {latestConflict && !query && (
            <div className="mb-8 bg-accent-red/10 border border-accent-red/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-accent-red" />
                <span className="text-[14px] text-accent-red">
                  PR <span className="font-bold">#{latestConflict.pr_number}</span> conflicts with your <span className="font-bold italic">&apos;{latestConflict.decision_title}&apos;</span> decision. This needs your attention.
                </span>
              </div>
              <a href={`/dashboard/${repoId}/conflicts`} className="text-[13px] text-white bg-accent-red hover:bg-accent-red/90 px-4 py-1.5 rounded-lg font-semibold transition-colors shadow-sm">
                Review Conflict
              </a>
            </div>
          )}

          {/* Metric cards (Bento box style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-accent-blue/10 group-hover:text-accent-blue group-hover:border-accent-blue/20 transition-all">
                  <FileCode className="w-5 h-5 text-slate-500 group-hover:text-accent-blue" />
                </div>
                <div className="text-[12px] text-slate-500 uppercase tracking-widest font-bold">Decisions Logged</div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-[40px] font-bold tracking-tight leading-none text-slate-900">{stats.total_decisions}</div>
                <div className="text-[13px] text-emerald-600 font-semibold mb-1">+{stats.decisions_this_month} this month</div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-accent-red/10 group-hover:text-accent-red group-hover:border-accent-red/20 transition-all">
                  <AlertTriangle className="w-5 h-5 text-slate-500 group-hover:text-accent-red" />
                </div>
                <div className="text-[12px] text-slate-500 uppercase tracking-widest font-bold">Active Conflicts</div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-[40px] font-bold tracking-tight leading-none text-slate-900 group-hover:text-accent-red transition-colors">{stats.unresolved_conflicts}</div>
                <div className="text-[13px] text-slate-500 font-semibold mb-1">Needs attention</div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer" onClick={() => window.location.href = `/dashboard/${repoId}/pending`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-200 transition-all">
                  <CheckCircle2 className="w-5 h-5 text-slate-500 group-hover:text-amber-600" />
                </div>
                <div className="text-[12px] text-slate-500 uppercase tracking-widest font-bold">Pending Decisions</div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-[40px] font-bold tracking-tight leading-none text-slate-900 group-hover:text-amber-600 transition-colors">{stats.pending_decisions}</div>
                <div className="text-[13px] text-slate-500 font-semibold mb-1">Action needed</div>
              </div>
            </div>

          </div>

          {/* Decisions List */}
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-[20px] font-bold text-slate-900 tracking-tight">Recent Decisions</h3>
          </div>
          
          <div className="flex flex-col gap-4">
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
              <div className="py-24 text-center flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
                <svg className="w-32 h-32 mb-6 text-slate-300" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 70C40 70 60 50 100 50C140 50 160 70 160 70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M100 50V150" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M70 120L100 150L130 120" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h4 className="text-[20px] font-bold text-slate-900 tracking-tight mb-2">No decisions logged yet</h4>
                <p className="text-[14px] text-slate-500 max-w-sm leading-relaxed">
                  DevBoard is monitoring your pull requests. Once you merge architectural changes, they will appear here.
                </p>
              </div>
            )}
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
