'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import ScoreBreakdownModal from './ScoreBreakdownModal';
import { formatDistanceToNow } from 'date-fns';

interface ScoreWidgetProps {
  repoId: string;
}

export default function ScoreWidget({ repoId }: ScoreWidgetProps) {
  const [data, setData] = useState<{ current: any; history: any[]; trend: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await fetch(`/api/repos/${repoId}/score`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch score', err);
      }
    };
    
    fetchScore();
    const interval = setInterval(fetchScore, 30000);
    return () => clearInterval(interval);
  }, [repoId]);

  if (!data || !data.current) return null;

  const { current, history, trend } = data;
  const score = current.score;

  // Determine levels
  let level = { label: 'Critical', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', desc: 'Architecture documentation is outdated or inconsistent.' };
  if (score >= 95) level = { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Architecture is consistent and well documented.' };
  else if (score >= 80) level = { label: 'Healthy', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', desc: 'Minor improvements recommended.' };
  else if (score >= 60) level = { label: 'Warning', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Architecture drift is beginning.' };
  else if (score >= 40) level = { label: 'Poor', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', desc: 'Multiple unresolved conflicts detected.' };

  // Circle properties
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer relative overflow-hidden group mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle cx="48" cy="48" r={radius} className="stroke-slate-100" strokeWidth="8" fill="transparent" />
              <motion.circle
                cx="48" cy="48" r={radius}
                className={level.color}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ strokeDasharray: circumference }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tighter text-slate-900">{score}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-[18px] font-bold text-slate-900">Architecture Score</h3>
              <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${level.bg} ${level.color} border ${level.border}`}>
                {level.label}
              </div>
            </div>
            <p className="text-[13px] text-slate-500 max-w-md">{level.desc}</p>
            
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
                {trend > 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : 
                 trend < 0 ? <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> :
                 <Minus className="w-3.5 h-3.5" />}
                <span className={trend > 0 ? "text-emerald-600" : trend < 0 ? "text-rose-600" : ""}>
                  {trend > 0 ? `+${trend}` : trend} this week
                </span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="text-[11px] text-slate-400">
                Updated {formatDistanceToNow(new Date(current.calculated_at))} ago
              </span>
            </div>
          </div>
        </div>

        {/* AI Insight Snippet */}
        {current.insights && current.insights.length > 0 && (
          <div className="hidden md:flex flex-col max-w-[280px] bg-slate-50 border border-slate-100 rounded-xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AI Insight</span>
            <p className="text-[12px] font-medium text-slate-700 italic leading-snug">
              "{current.insights[0]}"
            </p>
          </div>
        )}
      </div>

      <ScoreBreakdownModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        scoreData={current} 
        historyData={history} 
      />
    </>
  );
}
