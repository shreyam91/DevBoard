/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import { Sparkles, AlertTriangle, Lightbulb, FileWarning } from 'lucide-react';
import clsx from 'clsx';
import Markdown from 'react-markdown';

interface AIInsightsPanelProps {
  repoId: string;
  prNumber: string;
}

export function AIInsightsPanel({ repoId, prNumber }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/repos/${repoId}/prs/${prNumber}/insights`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to generate insights');
      const data = await res.json();
      setInsights(data.insights);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-slate-50 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Sparkles size={16} className="text-accent-blue" />
          AI Insights
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {!insights && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <Sparkles size={32} className="mb-4 text-slate-400" />
            <p className="text-sm mb-4">Generate an AI-powered summary of this Pull Request to identify risks, architectural changes, and breaking changes.</p>
            <button
              onClick={generateInsights}
              className="px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              Generate Insights
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mb-4"></div>
            <p className="text-sm animate-pulse">Analyzing Pull Request...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm flex flex-col gap-2 shadow-sm">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle size={16} /> Error
            </div>
            {error}
            <button onClick={generateInsights} className="text-red-500 hover:text-red-700 underline mt-2 self-start font-medium">Try again</button>
          </div>
        )}

        {insights && (
          <div className="prose prose-slate prose-sm max-w-none text-slate-700 prose-headings:text-slate-900 prose-a:text-accent-blue prose-strong:text-slate-900 prose-code:text-accent-blue prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
            <Markdown>{insights}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
