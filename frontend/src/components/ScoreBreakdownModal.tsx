'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoreData: any; // Using any for simplicity in this prototype, should be properly typed
  historyData: any[];
}

export default function ScoreBreakdownModal({ isOpen, onClose, scoreData, historyData }: ScoreBreakdownModalProps) {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | 'all'>('30');

  if (!scoreData) return null;

  // Filter history based on timeRange
  const now = new Date();
  const filteredHistory = historyData.filter(h => {
    if (timeRange === 'all') return true;
    const diffTime = Math.abs(now.getTime() - new Date(h.calculated_at).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= parseInt(timeRange);
  });

  const chartData = filteredHistory.map(h => ({
    date: format(new Date(h.calculated_at), 'MMM d'),
    score: h.score,
    fullDate: format(new Date(h.calculated_at), 'MMM d, yyyy')
  }));

  const metrics = [
    { label: 'Decision Compliance', value: scoreData.decision_compliance, weight: '35%', desc: 'How many merged PRs follow existing decisions.' },
    { label: 'Documentation Freshness', value: scoreData.documentation_freshness, weight: '25%', desc: 'How recently ARCHITECTURE.md was updated.' },
    { label: 'Decision Coverage', value: scoreData.decision_coverage, weight: '15%', desc: 'How much of the system has documented decisions.' },
    { label: 'Open Conflicts', value: scoreData.open_conflicts_score, weight: '15%', desc: 'Points deducted for unresolved conflicts.', rawLabel: true },
    { label: 'AI Confidence', value: scoreData.ai_confidence, weight: '10%', desc: 'Average confidence of detected decisions.' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20">
                  <TrendingUp className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-slate-900 leading-tight">Architecture Health</h2>
                  <p className="text-[12px] text-slate-500 font-medium">Detailed breakdown</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                
                {/* Timeline Chart */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[14px] font-semibold text-slate-900">Score Timeline</h3>
                    <div className="flex bg-slate-100 rounded-lg p-0.5">
                      {['7', '30', '90', 'all'].map(range => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range as any)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${timeRange === range ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {range === 'all' ? 'All Time' : `${range}d`}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="h-[180px] w-full bg-slate-50/50 border border-slate-100 rounded-xl p-4 pt-6">
                    {chartData.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                          <YAxis domain={[0, 100]} hide />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xl">
                                    <span className="text-slate-400 mr-2">{payload[0].payload.fullDate}</span>
                                    {payload[0].value}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line type="monotone" dataKey="score" stroke="#4B46E5" strokeWidth={3} dot={{ r: 4, fill: '#4B46E5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#4B46E5' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <TrendingUp className="w-6 h-6 mb-2 opacity-20" />
                        <span className="text-[12px] font-medium">Not enough historical data</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Sub-metrics */}
                <section>
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-4">Metric Breakdown</h3>
                  <div className="space-y-3">
                    {metrics.map((m, i) => (
                      <div key={i} className="group p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white shadow-sm hover:shadow transition-all relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-accent-blue/40 transition-colors" />
                        <div className="flex justify-between items-center mb-1 pl-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-bold text-slate-800">{m.label}</span>
                            <div className="group/tooltip relative">
                              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[11px] rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all shadow-xl pointer-events-none z-10 text-center">
                                {m.desc}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                              </div>
                            </div>
                          </div>
                          <span className="text-[14px] font-black text-slate-900 tracking-tight">
                            {m.rawLabel ? (100 - m.value) / 15 : `${Math.round(m.value)}%`}
                          </span>
                        </div>
                        <div className="pl-2 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-500">Weight: {m.weight}</span>
                          {/* Progress bar */}
                          <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-accent-blue rounded-full" style={{ width: `${m.value}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* AI Insights */}
                {scoreData.insights && scoreData.insights.length > 0 && (
                  <section>
                    <h3 className="text-[14px] font-semibold text-slate-900 mb-4">AI Recommendations</h3>
                    <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 space-y-2.5">
                      {scoreData.insights.map((insight: string, idx: number) => (
                        <div key={idx} className="flex gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <p className="text-[13px] font-medium text-amber-900 leading-snug">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
