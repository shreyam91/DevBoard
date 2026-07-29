/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Zap, 
  FileCode,
  Sparkles,
  ArrowRight,
  Gauge
} from 'lucide-react';
import clsx from 'clsx';

export function AIReviewDashboard({ repoId }: { repoId: string }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchReview = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/repos/${repoId}/architecture`);
      if (res.ok) {
        const analysis = await res.json();
        if (analysis.ai_review) {
          setData(analysis.ai_review);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const generateReview = async () => {
    try {
      setIsGenerating(true);
      setError('');
      const res = await fetch(`/api/repos/${repoId}/architecture-review`, { method: 'POST' });
      const analysis = await res.json();
      if (!res.ok) throw new Error(analysis.error || 'Failed to generate review');
      if (analysis.ai_review) {
        setData(analysis.ai_review);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-blue/20 border-t-accent-blue mb-4"></div>
        <p className="text-slate-600 font-medium">
          {isGenerating ? 'AI is reviewing your architecture...' : 'Loading review...'}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center max-w-md mx-auto">
        <Sparkles size={48} className="text-accent-blue mb-4" />
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">AI Architecture Review</h2>
        <p className="text-slate-500 mb-6">
          Generate a comprehensive AI review of your architecture, identifying bottlenecks, technical debt, and refactoring priorities based on the interactive graph.
        </p>
        
        {error && (
          <div className="p-3 mb-6 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2 border border-red-100">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span className="text-left">{error}</span>
          </div>
        )}

        <button
          onClick={generateReview}
          className="px-6 py-2.5 bg-accent-blue hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Sparkles size={16} /> Generate Review
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="text-accent-blue" />
            AI Architecture Review
          </h1>
          <p className="text-slate-500 mt-1">{data.architectureSummary}</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health Score</div>
            <div className={clsx(
              "text-3xl font-black",
              data.healthScore >= 80 ? "text-emerald-500" : data.healthScore >= 60 ? "text-amber-500" : "text-red-500"
            )}>
              {data.healthScore}/100
            </div>
          </div>
          <Gauge size={40} className={clsx(
              data.healthScore >= 80 ? "text-emerald-500" : data.healthScore >= 60 ? "text-amber-500" : "text-red-500"
            )} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Strengths */}
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
          <h3 className="font-semibold text-emerald-800 flex items-center gap-2 mb-3">
            <CheckCircle size={18} /> Strengths
          </h3>
          <ul className="space-y-2">
            {data.aiSummary.strengths.map((s: string, i: number) => (
              <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Weaknesses */}
        <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
          <h3 className="font-semibold text-rose-800 flex items-center gap-2 mb-3">
            <AlertTriangle size={18} /> Weaknesses
          </h3>
          <ul className="space-y-2">
            {data.aiSummary.weaknesses.map((s: string, i: number) => (
              <li key={i} className="text-sm text-rose-700 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Items */}
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
            <Activity size={18} /> Immediate Fixes
          </h3>
          <ul className="space-y-2">
            {data.aiSummary.immediateFixes.map((s: string, i: number) => (
              <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Zap size={20} className="text-amber-500" />
              Bottlenecks
            </h2>
            <div className="space-y-4">
              {data.bottlenecks.map((b: any, i: number) => (
                <div key={i} className="border-l-2 border-amber-300 pl-4 py-1">
                  <h4 className="font-medium text-slate-800 text-sm mb-1">{b.problem}</h4>
                  <p className="text-sm text-slate-500 mb-2">Impact: {b.impact}</p>
                  <div className="text-sm font-medium text-amber-700 flex items-start gap-1">
                    <ArrowRight size={14} className="mt-0.5 shrink-0" />
                    {b.recommendation}
                  </div>
                </div>
              ))}
              {data.bottlenecks.length === 0 && <p className="text-slate-500 text-sm">No major bottlenecks detected.</p>}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <FileCode size={20} className="text-purple-500" />
              Refactoring Priorities
            </h2>
            <div className="space-y-4">
              {data.refactoringPriorities.map((r: any, i: number) => (
                <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-mono text-sm font-bold text-slate-700">{r.module}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {r.complexity} Complexity
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{r.reason}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-medium text-slate-700">{r.dependencyCount} Dependencies</span>
                    &bull;
                    <span>{r.estimatedMaintenanceBenefit}</span>
                  </p>
                </div>
              ))}
              {data.refactoringPriorities.length === 0 && <p className="text-slate-500 text-sm">No urgent refactoring needed.</p>}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {(data.securityWarnings?.length > 0 || data.performanceWarnings?.length > 0) && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <ShieldAlert size={20} className="text-rose-500" />
                Warnings
              </h2>
              
              {data.securityWarnings?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Security</h3>
                  <ul className="space-y-2">
                    {data.securityWarnings.map((w: string, i: number) => (
                      <li key={i} className="text-sm text-rose-700 bg-rose-50 px-3 py-2 rounded-md">{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {data.performanceWarnings?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Performance</h3>
                  <ul className="space-y-2">
                    {data.performanceWarnings.map((w: string, i: number) => (
                      <li key={i} className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-md">{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-accent-blue" />
              Strategic Suggestions
            </h2>
            <div className="space-y-4">
              {data.suggestions.map((s: any, i: number) => (
                <div key={i} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-slate-800 text-sm">{s.title}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {s.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{s.reason}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-2 rounded text-xs">
                      <span className="block font-semibold text-slate-700 mb-0.5">Expected Benefit</span>
                      <span className="text-slate-500">{s.expectedBenefit}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded text-xs">
                      <span className="block font-semibold text-slate-700 mb-0.5">Estimated Impact</span>
                      <span className="text-slate-500">{s.estimatedImpact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
