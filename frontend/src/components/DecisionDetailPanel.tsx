'use client';

import React, { useEffect, useState } from 'react';

import { Category, Source } from '@prisma/client';

export type FullDecision = {
  id: string;
  title: string;
  rationale: string;
  category: Category;
  source: Source;
  pr_url?: string | null;
  pr_number?: number | null;
  created_at: string;
  confirmed_by_user: boolean;
  has_conflict: boolean;
};

export type FullConflict = {
  id: string;
  decision_id: string;
  decision_title: string;
  pr_url: string;
  pr_title: string;
  pr_number: number;
  description: string;
  resolved: boolean;
};

interface Props {
  decision: FullDecision;
  conflict?: FullConflict;
  onClose: () => void;
  onResolve?: () => void;
}

export default function DecisionDetailPanel({ decision, conflict, onClose, onResolve }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!mounted) return null;

  const dateStr = new Date(decision.created_at).toLocaleDateString(undefined, { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });

  return (
    <div 
      className="fixed right-0 top-0 h-full w-[260px] bg-[#fcfcfc] border-l border-[rgba(0,0,0,0.1)] shadow-[-4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-50 transform transition-transform duration-300 ease-out translate-x-0"
    >
      {/* Header */}
      <div className="h-[52px] px-4 border-b border-[rgba(0,0,0,0.1)] flex items-center justify-between shrink-0 bg-white">
        <span className="text-[12.5px] font-medium text-neutral-900">Decision Details</span>
        <button 
          onClick={onClose}
          className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] hover:bg-neutral-100 text-[rgba(0,0,0,0.45)] hover:text-neutral-900 transition-colors"
        >
          <i className="ti ti-x text-[16px]"></i>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 pb-8 flex flex-col gap-6">
        
        {conflict && !conflict.resolved && (
          <div className="bg-[#FCEBEB] rounded-[6px] p-3 border border-[#F09595]">
            <div className="flex items-center gap-2 mb-2">
              <i className="ti ti-alert-triangle text-[#A32D2D] text-[14px]"></i>
              <span className="text-[12px] font-medium text-[#791F1F]">Active Conflict</span>
            </div>
            <p className="text-[11.5px] text-[#A32D2D] leading-relaxed">
              {conflict.description}
            </p>
          </div>
        )}

        <div>
          <div className="text-[10px] uppercase text-[rgba(0,0,0,0.45)] font-medium tracking-wider mb-1.5">Title</div>
          <div className="text-[13px] font-medium text-neutral-900 leading-snug">{decision.title}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase text-[rgba(0,0,0,0.45)] font-medium tracking-wider mb-1.5">Category</div>
          <div className="text-[13px] text-neutral-900 capitalize">{decision.category}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase text-[rgba(0,0,0,0.45)] font-medium tracking-wider mb-1.5">Date Logged</div>
          <div className="text-[13px] text-neutral-900">{dateStr}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase text-[rgba(0,0,0,0.45)] font-medium tracking-wider mb-1.5">Source</div>
          <div className="text-[13px] text-neutral-900 capitalize flex items-center gap-2">
            {decision.source === 'pr' ? (
              <a href={decision.pr_url || '#'} target="_blank" rel="noopener noreferrer" className="text-[#5551ff] hover:underline flex items-center gap-1.5">
                <i className="ti ti-git-pull-request text-[14px]"></i>
                PR #{decision.pr_number}
              </a>
            ) : decision.source}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase text-[rgba(0,0,0,0.45)] font-medium tracking-wider mb-1.5">Rationale</div>
          <div className="text-[13px] text-[rgba(0,0,0,0.7)] leading-[1.6]">
            {decision.rationale}
          </div>
        </div>
        
      </div>

      {/* Footer */}
      {conflict && !conflict.resolved && onResolve && (
        <div className="p-4 bg-white border-t border-[rgba(0,0,0,0.1)] shrink-0">
          <button 
            onClick={onResolve}
            className="w-full h-[36px] bg-[#A32D2D] hover:bg-[#8A2424] text-white text-[12.5px] font-medium rounded-[6px] transition-colors flex items-center justify-center gap-2"
          >
            <i className="ti ti-check text-[14px]"></i>
            Resolve Conflict
          </button>
        </div>
      )}
    </div>
  );
}
