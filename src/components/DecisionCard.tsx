'use client';

import React from 'react';

export type Category = 'database' | 'infra' | 'api' | 'architecture' | 'tooling';
export type Source = 'pr' | 'archaeology' | 'manual' | 'questionnaire';

export interface DecisionCardProps {
  decision: {
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
  onClick: () => void;
  onConfirm?: () => void;
}

const categoryColors: Record<Category, { bg: string, text: string }> = {
  database: { bg: '#EEEDFE', text: '#3C3489' },
  infra: { bg: '#E1F5EE', text: '#085041' },
  api: { bg: '#FAEEDA', text: '#633806' },
  architecture: { bg: '#E6F1FB', text: '#0C447C' },
  tooling: { bg: '#F1EFE8', text: '#444441' },
};

export default function DecisionCard({
  decision,
  onClick,
  onConfirm
}: DecisionCardProps) {
  
  const isUnconfirmed = !decision.confirmed_by_user && (decision.source === 'pr' || decision.source === 'archaeology');
  const isConflict = decision.has_conflict;

  let cardStyle = "bg-white border-[0.5px] border-[rgba(0,0,0,0.1)] hover:border-[rgba(0,0,0,0.2)]";
  if (isConflict) {
    cardStyle = "bg-[#FCEBEB] border-[1px] border-[#F09595]";
  } else if (isUnconfirmed) {
    cardStyle = "bg-white border border-dashed border-[#B4B2A9]";
  }

  const titleColor = isConflict ? "text-[#791F1F]" : "text-neutral-900";
  const descColor = isConflict ? "text-[#791F1F]" : "text-[rgba(0,0,0,0.7)]";

  const getSourceText = () => {
    const dateStr = new Date(decision.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    if (decision.source === 'pr' && decision.pr_number) {
      return `Detected from PR #${decision.pr_number} · ${dateStr}`;
    }
    if (decision.source === 'archaeology') {
      return `Detected from codebase · ${dateStr}`;
    }
    if (decision.source === 'questionnaire') {
      return `Logged from onboarding · ${dateStr}`;
    }
    return `Logged manually · ${dateStr}`;
  };

  return (
    <div 
      onClick={onClick}
      className={`p-[12px] px-[14px] rounded-[9px] cursor-pointer transition-colors flex flex-col ${cardStyle}`}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className={`text-[13px] font-medium leading-tight ${titleColor}`}>
          {decision.title}
        </h3>
        
        {isConflict ? (
          <span className="px-2 py-[2px] rounded-[4px] text-[10px] font-medium bg-[#FCEBEB] text-[#A32D2D] leading-none ml-3 shrink-0">
            Conflict
          </span>
        ) : isUnconfirmed ? (
          <span className="px-2 py-[2px] rounded-[4px] text-[10px] font-medium bg-[#F1EFE8] text-[#444441] border border-dashed border-[#B4B2A9] leading-none ml-3 shrink-0">
            AI Suggested
          </span>
        ) : (
          <span 
            className="px-2 py-[2px] rounded-[4px] text-[10px] font-medium leading-none ml-3 shrink-0"
            style={{ backgroundColor: categoryColors[decision.category]?.bg, color: categoryColors[decision.category]?.text }}
          >
            {decision.category}
          </span>
        )}
      </div>

      <div className="text-[11px] text-[rgba(0,0,0,0.45)] mb-[6px]">
        {getSourceText()}
      </div>
      
      <p className={`text-[12px] leading-[1.55] line-clamp-2 ${descColor}`}>
        {decision.rationale}
      </p>
      
      <div className="mt-3 pt-3 border-t border-[rgba(0,0,0,0.06)] flex justify-between items-center h-[24px]">
        {decision.pr_url ? (
          <a 
            href={decision.pr_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#5551ff] text-[11px] hover:underline flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="ti ti-git-pull-request text-[12px]"></i>
            Source PR
          </a>
        ) : (
          <div></div> // Empty div for flex spacing
        )}
        
        {isUnconfirmed && onConfirm && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="bg-[#E1F5EE] border border-[#1D9E75] text-[#085041] rounded-[6px] text-[11px] font-medium py-[3px] px-[10px] hover:bg-[#d1efe4] transition-colors"
          >
            Confirm decision
          </button>
        )}
      </div>
    </div>
  );
}
