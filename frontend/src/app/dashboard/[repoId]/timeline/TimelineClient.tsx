'use client';

import React, { useState } from 'react';
import DecisionTimeline, { TimelineDecision } from '@/components/timeline/DecisionTimeline';
import DecisionDetailPanel, { FullConflict } from '@/components/DecisionDetailPanel';

interface Props {
  initialDecisions: TimelineDecision[];
  initialConflicts: FullConflict[];
}

export type Category = 'database' | 'infra' | 'api' | 'architecture' | 'tooling';

const categories: { id: Category | 'all'; label: string; activeStyle: string }[] = [
  { id: 'all', label: 'All', activeStyle: 'bg-[#0c0c0c] text-[#fff] border-[#0c0c0c]' },
  { id: 'database', label: 'Database', activeStyle: 'bg-[#EEEDFE] text-[#3C3489] border-[#AFA9EC]' },
  { id: 'infra', label: 'Infra', activeStyle: 'bg-[#E1F5EE] text-[#085041] border-[#5DCAA5]' },
  { id: 'api', label: 'API', activeStyle: 'bg-[#FAEEDA] text-[#633806] border-[#EF9F27]' },
  { id: 'architecture', label: 'Architecture', activeStyle: 'bg-[#E6F1FB] text-[#0C447C] border-[#85B7EB]' },
  { id: 'tooling', label: 'Tooling', activeStyle: 'bg-[#F1EFE8] text-[#444441] border-[#B4B2A9]' },
];

const legendItems = [
  { label: 'Database', color: '#7F77DD' },
  { label: 'Infra', color: '#1D9E75' },
  { label: 'API', color: '#BA7517' },
  { label: 'Architecture', color: '#378ADD' },
  { label: 'Tooling', color: '#888780' },
];

export default function TimelineClient({ initialDecisions, initialConflicts }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  const selectedDecision = initialDecisions.find(d => d.id === selectedDecisionId) || null;
  const conflict = initialConflicts.find(c => c.decision_id === selectedDecisionId);

  return (
    <div className="flex relative h-full">
      <div className="flex flex-col flex-1 h-full max-w-full relative">
        
        {/* Filter bar */}
        <div className="h-[56px] border-b border-[rgba(0,0,0,0.1)] flex items-center px-5 shrink-0 gap-3">
          <span className="text-[11px] text-[rgba(0,0,0,0.45)]">Category</span>
          <div className="flex gap-2">
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              const baseStyle = "text-[11px] font-medium px-[12px] py-[4px] rounded-[20px] transition-colors cursor-pointer border-[0.5px] border-solid";
              const inactiveStyle = "border-[rgba(0,0,0,0.1)] bg-transparent text-[rgba(0,0,0,0.45)] hover:border-[rgba(0,0,0,0.2)]";
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`${baseStyle} ${isActive ? cat.activeStyle : inactiveStyle}`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* D3 Canvas container */}
        <div className="flex-1 overflow-hidden relative">
          <DecisionTimeline 
            decisions={initialDecisions}
            selectedCategory={selectedCategory}
            onDecisionClick={setSelectedDecisionId}
          />
        </div>

        {/* Legend strip */}
        <div className="h-[48px] border-t border-[rgba(0,0,0,0.1)] flex items-center px-[20px] gap-[16px] flex-wrap shrink-0 bg-neutral-50">
          {legendItems.map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-[11px] text-[rgba(0,0,0,0.6)]">{item.label}</span>
            </div>
          ))}
          <div className="w-[1px] h-[12px] bg-[rgba(0,0,0,0.1)] mx-2"></div>
          <div className="flex items-center gap-1.5">
            <div className="w-[9px] h-[9px] rounded-full border-[2px] border-solid border-[#E24B4A]"></div>
            <span className="text-[11px] text-[rgba(0,0,0,0.6)]">Has conflict</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-[9px] h-[9px] rounded-full border-[1.5px] border-dashed border-[#888780]"></div>
            <span className="text-[11px] text-[rgba(0,0,0,0.6)]">Unconfirmed</span>
          </div>
        </div>
      </div>

      {/* Slide in panel overlay alongside timeline */}
      {selectedDecision && (
        <DecisionDetailPanel
          decision={selectedDecision}
          conflict={conflict}
          onClose={() => setSelectedDecisionId(null)}
        />
      )}
    </div>
  );
}
