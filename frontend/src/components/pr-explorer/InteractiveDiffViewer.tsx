/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChevronRight, ChevronDown, FileText, FilePlus, FileMinus, Layout } from 'lucide-react';
import clsx from 'clsx';
import { File } from 'parse-diff';

interface InteractiveDiffViewerProps {
  files: File[];
  isLoading: boolean;
}

export function InteractiveDiffViewer({ files, isLoading }: InteractiveDiffViewerProps) {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});

  // By default, expand all files
  useMemo(() => {
    if (files.length > 0 && Object.keys(expandedFiles).length === 0) {
      const initial: Record<string, boolean> = {};
      files.forEach((f, i) => { initial[f.to || f.from || String(i)] = true; });
      setExpandedFiles(initial);
    }
  }, [files, expandedFiles]);

  const toggleFile = (fileName: string) => {
    setExpandedFiles(prev => ({ ...prev, [fileName]: !prev[fileName] }));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No files changed.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <div className="text-sm text-slate-700 font-medium">
          {files.length} changed file{files.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('unified')}
            className={clsx(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
              viewMode === 'unified' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <Layout size={14} />
            Unified
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={clsx(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
              viewMode === 'split' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <Layout size={14} className="rotate-90" />
            Split
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {files.map((file, i) => {
          const fileName = file.to || file.from || `file-${i}`;
          const isExpanded = expandedFiles[fileName];
          
          let fileIcon = <FileText size={16} className="text-slate-400" />;
          if (file.new) fileIcon = <FilePlus size={16} className="text-green-600" />;
          if (file.deleted) fileIcon = <FileMinus size={16} className="text-red-600" />;

          return (
            <div key={fileName} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div
                className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => toggleFile(fileName)}
              >
                <div className="flex items-center gap-2">
                  <button className="text-slate-400 hover:text-slate-600">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {fileIcon}
                  <span className="font-mono text-sm text-slate-700">{fileName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-green-600">+{file.additions}</span>
                  <span className="text-red-600">-{file.deletions}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="overflow-x-auto text-[13px] leading-relaxed">
                  {file.chunks.map((chunk, chunkIdx) => (
                    <div key={chunkIdx} className="mb-4 last:mb-0">
                      <div className="bg-slate-100 text-slate-500 px-4 py-1.5 font-mono text-xs border-y border-slate-200">
                        {chunk.content}
                      </div>
                      
                      {viewMode === 'unified' ? (
                        <div className="font-mono flex flex-col w-full min-w-max">
                          {chunk.changes.map((change, idx) => (
                            <DiffLine key={idx} change={change} viewMode="unified" />
                          ))}
                        </div>
                      ) : (
                        <div className="font-mono flex flex-col w-full min-w-max">
                          {chunk.changes.map((change, idx) => (
                            <DiffLine key={idx} change={change} viewMode="split" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiffLine({ change, viewMode }: { change: any, viewMode: 'unified' | 'split' }) {
  const isAdd = change.type === 'add';
  const isDel = change.type === 'del';
  const isNormal = change.type === 'normal';

  const bgColor = isAdd ? 'bg-green-50' : isDel ? 'bg-red-50' : 'bg-transparent';
  const numColor = isAdd ? 'text-green-600/50' : isDel ? 'text-red-600/50' : 'text-slate-400';
  const contentColor = isAdd ? 'text-green-700' : isDel ? 'text-red-700' : 'text-slate-700';
  
  if (viewMode === 'unified') {
    return (
      <div className={clsx("flex hover:bg-slate-50", bgColor)}>
        <div className={clsx("w-12 text-right pr-3 select-none py-0.5 border-r border-slate-200", numColor)}>
          {change.oldLine || change.ln1 || ' '}
        </div>
        <div className={clsx("w-12 text-right pr-3 select-none py-0.5 border-r border-slate-200", numColor)}>
          {change.newLine || change.ln2 || ' '}
        </div>
        <div className={clsx("w-6 text-center select-none py-0.5", numColor)}>
          {isAdd ? '+' : isDel ? '-' : ' '}
        </div>
        <div className={clsx("flex-1 px-2 py-0.5 whitespace-pre", contentColor)}>
          <SyntaxHighlighter
            language="typescript" // simplified, should dynamically detect based on file extension
            style={vscDarkPlus}
            customStyle={{ padding: 0, margin: 0, background: 'transparent' }}
            PreTag="div"
            wrapLongLines={false}
          >
            {change.content.replace(/^[+-]/, '')}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  // Simplified Split view rendering
  return (
    <div className={clsx("flex hover:bg-slate-50", bgColor)}>
      <div className="w-1/2 flex border-r border-slate-200">
         <div className={clsx("w-12 text-right pr-3 select-none py-0.5 border-r border-slate-200", isDel ? numColor : 'text-slate-400')}>
            {isDel || isNormal ? (change.oldLine || change.ln1) : ' '}
         </div>
         <div className={clsx("flex-1 px-4 py-0.5 whitespace-pre overflow-hidden", isDel ? 'text-red-700' : 'text-slate-700')}>
           {(isDel || isNormal) && (
             <SyntaxHighlighter
               language="typescript"
               style={vscDarkPlus}
               customStyle={{ padding: 0, margin: 0, background: 'transparent' }}
               PreTag="div"
             >
               {change.content.replace(/^[+-]/, '')}
             </SyntaxHighlighter>
           )}
         </div>
      </div>
      <div className="w-1/2 flex">
         <div className={clsx("w-12 text-right pr-3 select-none py-0.5 border-r border-slate-200", isAdd ? numColor : 'text-slate-400')}>
            {isAdd || isNormal ? (change.newLine || change.ln2) : ' '}
         </div>
         <div className={clsx("flex-1 px-4 py-0.5 whitespace-pre overflow-hidden", isAdd ? 'text-green-700' : 'text-slate-700')}>
           {(isAdd || isNormal) && (
             <SyntaxHighlighter
               language="typescript"
               style={vscDarkPlus}
               customStyle={{ padding: 0, margin: 0, background: 'transparent' }}
               PreTag="div"
             >
               {change.content.replace(/^[+-]/, '')}
             </SyntaxHighlighter>
           )}
         </div>
      </div>
    </div>
  );
}
