'use client';

import React, { useState } from 'react';
import { Category } from '@/components/DecisionCard';

const categoryColors: Record<Category, { bg: string, text: string }> = {
  database: { bg: '#EEEDFE', text: '#3C3489' },
  infra: { bg: '#E1F5EE', text: '#085041' },
  api: { bg: '#FAEEDA', text: '#633806' },
  architecture: { bg: '#E6F1FB', text: '#0C447C' },
  tooling: { bg: '#F1EFE8', text: '#444441' },
};

import { FullConflict } from '@/components/DecisionDetailPanel';

export default function ConflictsClient({ initialConflicts }: { initialConflicts: (FullConflict & { decision_title: string, decision_category: string, created_at: string })[] }) {
  const [conflicts, setConflicts] = useState(initialConflicts);

  const handleResolve = async (id: string) => {
    const res = await fetch(`/api/conflicts/${id}/resolve`, { method: 'PATCH' });
    if (res.ok) {
      setConflicts(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="flex flex-col">
      {conflicts.map((conflict, index) => {
        const dateStr = new Date(conflict.created_at).toLocaleDateString(undefined, { 
          month: 'short', day: 'numeric', year: 'numeric' 
        });

        return (
          <div 
            key={conflict.id} 
            className={`flex items-center px-4 h-[60px] ${index !== conflicts.length - 1 ? 'border-b border-[rgba(0,0,0,0.06)]' : ''}`}
          >
            <div className="flex-[2] pr-4 truncate">
              <a href={conflict.pr_url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-neutral-900 hover:underline">
                {conflict.pr_title} <span className="text-[rgba(0,0,0,0.45)]">#{conflict.pr_number}</span>
              </a>
            </div>
            
            <div className="flex-[2] pr-4 flex items-center gap-2 truncate">
              <span className="text-[13px] text-neutral-900 truncate max-w-[200px]">
                {conflict.decision_title}
              </span>
              <span 
                className="px-2 py-[2px] rounded-[4px] text-[10px] font-medium leading-none shrink-0"
                style={{ 
                  backgroundColor: categoryColors[conflict.decision_category as Category]?.bg || '#f1efe8', 
                  color: categoryColors[conflict.decision_category as Category]?.text || '#444' 
                }}
              >
                {conflict.decision_category}
              </span>
            </div>
            
            <div className="flex-[1] text-[12px] text-[rgba(0,0,0,0.45)] pr-4">
              {dateStr}
            </div>
            
            <div className="w-[100px] flex justify-end">
              <button 
                onClick={() => handleResolve(conflict.id)}
                className="h-[26px] px-3 border border-[rgba(0,0,0,0.15)] rounded-[6px] text-[11px] font-medium hover:bg-neutral-50 transition-colors"
              >
                Resolve
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
