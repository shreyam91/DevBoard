'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, GitPullRequest, Code, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export type PendingDecisionDto = {
  id: string;
  repo_id: string;
  pr_number: number;
  title: string;
  description: string;
  rationale: string;
  confidence: number;
  affected_files: string[] | null;
  suggested_markdown: string | null;
  status: string;
  created_at: string;
};

interface Props {
  repoId: string;
  initialPendingDecisions: PendingDecisionDto[];
}

export default function PendingClient({ repoId, initialPendingDecisions }: Props) {
  const [decisions, setDecisions] = useState(initialPendingDecisions);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (id: string, action: 'approve' | 'discard') => {
    setLoadingAction(id);
    try {
      const res = await fetch(`/api/repos/${repoId}/pending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingDecisionId: id, action })
      });

      if (!res.ok) throw new Error('Failed to process action');
      
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'approve' ? 'Architecture update queued!' : 'Decision discarded');
        setDecisions(prev => prev.filter(d => d.id !== id));
        router.refresh();
      } else {
        toast.error(data.error || 'An error occurred');
      }
    } catch (err) {
      toast.error('Failed to process action');
    } finally {
      setLoadingAction(null);
    }
  };

  if (decisions.length === 0) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <Check className="w-16 h-16 text-emerald-500 mb-6" />
        <h4 className="text-xl font-bold text-slate-900 tracking-tight mb-2">You're all caught up!</h4>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
          No pending architectural decisions. We'll notify you when a merged pull request introduces a new pattern.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence>
        {decisions.map(decision => {
          const isExpanded = expandedId === decision.id;
          const confidenceColor = 
            decision.confidence >= 0.8 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 
            decision.confidence >= 0.5 ? 'text-amber-600 bg-amber-50 border-amber-200' : 
            'text-rose-600 bg-rose-50 border-rose-200';

          return (
            <motion.div
              key={decision.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
            >
              <div 
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-4"
                onClick={() => setExpandedId(isExpanded ? null : decision.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{decision.title}</h3>
                    <div className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${confidenceColor}`}>
                      {Math.round(decision.confidence * 100)}% Confidence
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                    {decision.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <GitPullRequest className="w-4 h-4" />
                      PR #{decision.pr_number}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      {decision.affected_files?.length || 0} files affected
                    </span>
                    <span>
                      {new Date(decision.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className="text-slate-400 p-2">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 overflow-hidden"
                  >
                    <div className="p-6 bg-slate-50 flex flex-col gap-6">
                      
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Rationale</h4>
                        <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                          {decision.rationale}
                        </p>
                      </div>

                      {decision.suggested_markdown && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            Suggested Architecture Markdown
                          </h4>
                          <pre className="text-sm font-mono text-slate-700 bg-white border border-slate-200 p-4 rounded-xl shadow-sm overflow-x-auto">
                            {decision.suggested_markdown}
                          </pre>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-3 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(decision.id, 'discard');
                          }}
                          disabled={loadingAction !== null}
                          className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Discard
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(decision.id, 'approve');
                          }}
                          disabled={loadingAction !== null}
                          className="px-4 py-2 text-sm font-semibold text-white bg-accent-blue rounded-lg hover:bg-accent-blue/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                        >
                          {loadingAction === decision.id ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Approve & Update
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
