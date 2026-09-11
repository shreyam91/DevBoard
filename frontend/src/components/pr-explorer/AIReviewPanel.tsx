/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, AlertTriangle, ShieldAlert, Gauge, ThumbsUp, ThumbsDown, X, Send, FileWarning, Layers } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface ReviewResponse {
  pullRequest: any;
  reviews: any[];
}

const SEVERITY_META: Record<string, { label: string; color: 'red' | 'amber' | 'yellow' | 'slate'; dot: string }> = {
  critical: { label: 'Critical', color: 'red', dot: 'bg-red-600' },
  high: { label: 'High', color: 'amber', dot: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'yellow', dot: 'bg-yellow-400' },
  low: { label: 'Low', color: 'slate', dot: 'bg-slate-400' },
};

const CATEGORY_DOT: Record<string, string> = {
  bug: 'bg-pink-500',
  security: 'bg-purple-500',
  performance: 'bg-blue-500',
  quality: 'bg-teal-500',
  testing: 'bg-indigo-500',
  architecture: 'bg-emerald-500',
};

function severityBadge(severity: string) {
  const meta = SEVERITY_META[severity] || SEVERITY_META.low;
  return (
    <span className={clsx(
      'text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded',
      severity === 'critical' && 'bg-red-100 text-red-700',
      severity === 'high' && 'bg-orange-100 text-orange-700',
      severity === 'medium' && 'bg-yellow-100 text-yellow-700',
      severity === 'low' && 'bg-slate-100 text-slate-600'
    )}>
      {meta.label}
    </span>
  );
}

export function AIReviewPanel({ repoId, prNumber }: { repoId: string; prNumber: string }) {
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyFinding, setBusyFinding] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/repos/${repoId}/prs/${prNumber}/review`);
      if (!res.ok) throw new Error('Failed to load review');
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [repoId, prNumber]);

  useEffect(() => { load(); }, [load]);

  const runReview = async () => {
    setRunning(true);
    try {
      const res = await fetch(`/api/repos/${repoId}/prs/${prNumber}/review`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to run review');
      const json = await res.json();
      toast.success(json.enqueued ? 'Review started' : 'Review already in progress');
      setTimeout(load, 4000);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRunning(false);
    }
  };

  const postToGithub = async () => {
    setRunning(true);
    try {
      const res = await fetch(`/api/repos/${repoId}/prs/${prNumber}/review/post`, { method: 'POST' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to post');
      }
      toast.success('Posted to GitHub');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRunning(false);
    }
  };

  const sendFeedback = async (findingId: string, reaction: string) => {
    setBusyFinding(findingId);
    try {
      const res = await fetch(`/api/repos/${repoId}/prs/${prNumber}/review/findings/${findingId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      });
      if (!res.ok) throw new Error('Failed');
      load();
    } catch { toast.error('Feedback failed'); } finally { setBusyFinding(null); }
  };

  const latest = data?.reviews?.[0] || null;
  const reviews = data?.reviews || [];
  const findings = latest?.findings || [];
  const counts = findings.reduce((acc: any, f: any) => (acc[f.severity] = (acc[f.severity] || 0) + 1, acc), {});
  const archImpacts = latest?.architecture_impact || [];
  const docImpacts = latest?.documentation_impact || [];

  return (
    <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-slate-50 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <ShieldAlert size={16} className="text-accent-blue" />
          AI Review
        </h2>
        <StatusBadge status={latest?.status} />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm mb-3">
            {error}
          </div>
        )}

        {!data && loading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mb-4" />
            <p className="text-sm animate-pulse">Loading review...</p>
          </div>
        )}

        {!latest && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 gap-4">
            <ShieldAlert size={32} className="text-slate-400" />
            <p className="text-sm">Run an AI review to surface bugs, security, performance and architecture issues.</p>
            <button onClick={runReview} disabled={running}
              className="px-4 py-2 bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm">
              {running ? 'Running...' : 'Run AI Review'}
            </button>
          </div>
        )}

        {latest && (
          <div className="space-y-4">
            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={runReview} disabled={running}
                className="flex-1 px-3 py-1.5 bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg">
                {running ? 'Running...' : 'Re-run'}
              </button>
              <button onClick={postToGithub} disabled={running || findings.length === 0}
                className="flex-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1">
                <Send size={12} /> Post to GitHub
              </button>
            </div>

            {/* Summary + Intent */}
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-xs text-slate-700 leading-relaxed">{latest.summary || latest.intent}</p>
              {latest.intent && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Intent</span>
                  <p className="text-xs text-slate-600 mt-0.5">{latest.intent}</p>
                </div>
              )}
            </div>

            {/* Counts */}
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(SEVERITY_META)).map(sev => (
                <div key={sev} className="bg-white rounded-lg border border-slate-200 p-2 text-center">
                  <div className={clsx('w-2 h-2 rounded-full mx-auto mb-1', SEVERITY_META[sev].dot)} />
                  <div className="text-lg font-semibold text-slate-800">{counts[sev] || 0}</div>
                  <div className="text-[9px] uppercase tracking-wide text-slate-400">{sev}</div>
                </div>
              ))}
            </div>

            {/* Findings */}
            {findings.length === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-700 text-sm">
                No findings — the change looks clean.
              </div>
            )}
            {findings.map((f: any) => {
              const userReaction = f.feedback?.[0]?.reaction;
              return (
                <div key={f.id} className={clsx('bg-white rounded-lg border p-3', f.status === 'dismissed' ? 'border-slate-200 opacity-50' : 'border-slate-200')}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {severityBadge(f.severity)}
                      <span className={clsx('w-2 h-2 rounded-full', CATEGORY_DOT[f.category] || 'bg-slate-300')} title={f.category} />
                    </div>
                    <span className="text-[10px] text-slate-400">{Math.round(f.confidence * 100)}%</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mt-1.5">{f.title}</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{f.description}</p>
                  {f.file && (
                    <p className="text-[11px] font-mono text-accent-blue mt-1.5">
                      {f.file}{f.line ? `:${f.line}` : ''}{f.line_end && f.line_end !== f.line ? `-${f.line_end}` : ''}
                    </p>
                  )}
                  {f.suggestion && (
                    <div className="mt-2 bg-blue-50 border border-blue-100 rounded p-2 text-xs text-slate-700">
                      <span className="font-semibold text-blue-700">Suggestion: </span>{f.suggestion}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2.5">
                    <button disabled={busyFinding === f.id}
                      onClick={() => sendFeedback(f.id, 'useful')}
                      className={clsx('flex items-center gap-1 text-[11px] px-2 py-1 rounded border',
                        userReaction === 'useful' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50')}>
                      <ThumbsUp size={12} /> Useful
                    </button>
                    <button disabled={busyFinding === f.id}
                      onClick={() => sendFeedback(f.id, 'false_positive')}
                      className={clsx('flex items-center gap-1 text-[11px] px-2 py-1 rounded border',
                        userReaction === 'false_positive' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50')}>
                      <ThumbsDown size={12} /> False +ve
                    </button>
                    {f.status !== 'dismissed' && (
                      <button disabled={busyFinding === f.id}
                        onClick={() => sendFeedback(f.id, 'dismiss')}
                        className="flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 ml-auto">
                        <X size={12} /> Dismiss
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Architecture impact */}
            {archImpacts.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1 flex items-center gap-1"><Layers size={12} /> Architecture</p>
                {archImpacts.map((a: any, i: number) => (
                  <p key={i} className="text-xs text-slate-600 mb-1">⚠️ {a.decisionTitle || a.document}: {a.reason}</p>
                ))}
              </div>
            )}

            {/* Documentation impact */}
            {docImpacts.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1 flex items-center gap-1"><FileWarning size={12} /> Documentation</p>
                {docImpacts.map((d: any, i: number) => (
                  <p key={i} className="text-xs text-slate-600 mb-0.5">• {d.document} — {d.reason}</p>
                ))}
              </div>
            )}

            {/* Review history */}
            {reviews.length > 1 && (
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Review History</p>
                {reviews.map((r: any, i: number) => (
                  <div key={r.id} className="flex items-center justify-between text-xs text-slate-500 py-0.5">
                    <span>{new Date(r.created_at).toLocaleString()}</span>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    queued: 'bg-slate-100 text-slate-600',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
  };
  return (
    <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full capitalize', map[status || 'queued'] || map.queued)}>
      {status || 'queued'}
    </span>
  );
}