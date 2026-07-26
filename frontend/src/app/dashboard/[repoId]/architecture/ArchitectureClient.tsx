'use client';

import React from 'react';
import { FileCode, Download, ExternalLink, RefreshCw, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  repoId: string;
  initialContent: string;
  lastUpdated: string | null;
  version: number;
}

export default function ArchitectureClient({ repoId, initialContent, lastUpdated, version }: Props) {
  
  const handleDownload = () => {
    const blob = new Blob([initialContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ARCHITECTURE.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      {/* Top bar */}
      <header className="h-[64px] bg-white/60 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">ARCHITECTURE.md</h2>
          <div className="w-px h-4 bg-slate-300"></div>
          {lastUpdated ? (
            <span className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })} (v{version})
            </span>
          ) : (
            <span className="text-[13px] font-medium text-slate-500">Not generated yet</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="h-[36px] px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm rounded-lg flex items-center gap-2 transition-all group">
            <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="text-[13px] font-semibold text-slate-700">Regenerate</span>
          </button>
          <button 
            onClick={handleDownload}
            className="h-[36px] px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm rounded-lg flex items-center gap-2 transition-all group"
          >
            <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="text-[13px] font-semibold text-slate-700">Download</span>
          </button>
          <a 
            href={`https://github.com/${repoId}/blob/main/ARCHITECTURE.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-[36px] px-4 bg-accent-blue hover:bg-accent-blue/90 shadow-sm rounded-lg flex items-center gap-2 transition-all group"
          >
            <ExternalLink className="w-4 h-4 text-white/90 group-hover:text-white" />
            <span className="text-[13px] font-semibold text-white">Open in GitHub</span>
          </a>
        </div>
      </header>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-[850px] mx-auto bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-3">
            <FileCode className="w-5 h-5 text-slate-400" />
            <span className="text-[13px] font-mono text-slate-600 font-semibold">ARCHITECTURE.md</span>
          </div>

          <article className="p-8 md:p-12 max-w-none text-slate-700 text-[15px] leading-relaxed prose prose-slate prose-a:text-accent-blue hover:prose-a:text-accent-blue/80 prose-headings:font-bold prose-headings:tracking-tight">
            <ReactMarkdown>
              {initialContent}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
