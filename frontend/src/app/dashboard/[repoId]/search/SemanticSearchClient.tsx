'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Filter, Loader2, GitCommit, FileCode, GitPullRequest, Send, User } from 'lucide-react';
import clsx from 'clsx';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  content: string;
  path: string;
  similarity: number;
}

export default function SemanticSearchClient({ repoId }: { repoId: string }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setDebouncedQuery(query);
      } else {
        setResults([]);
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute search
  useEffect(() => {
    if (!debouncedQuery) return;

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/repos/${repoId}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: debouncedQuery, 
            filters: activeFilter !== 'all' ? { type: activeFilter } : {}
          })
        });
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, activeFilter, repoId]);

  // Execute Chat
  const handleAskAI = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const message = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsChatLoading(true);

    try {
      const res = await fetch(`/api/repos/${repoId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      
      if (data.answer) {
        setChatMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error answering your question.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'commit': return <GitCommit size={16} className="text-emerald-500" />;
      case 'pull_request': return <GitPullRequest size={16} className="text-purple-500" />;
      default: return <FileCode size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50 relative">
      
      {/* Sidebar Filters */}
      <div className="w-64 border-r border-slate-200 bg-white p-4 flex flex-col hidden md:flex">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4 text-slate-800">
          <Filter size={16} /> Filters
        </h2>
        
        <div className="space-y-1">
          {['all', 'code_chunk', 'commit', 'pull_request'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={clsx(
                "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeFilter === filter 
                  ? "bg-accent-blue/10 text-accent-blue" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Main Search Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Search Header */}
        <div className="p-6 border-b border-slate-200 bg-white shadow-sm z-10 flex gap-4">
          <div className="relative flex-1 max-w-3xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent-blue transition-colors" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search code, commits, PRs naturally (e.g. 'how does authentication work?')"
              className="w-full pl-12 pr-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-accent-blue focus:outline-none transition-all text-slate-900 placeholder:text-slate-500"
            />
          </div>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={clsx(
              "px-4 flex items-center gap-2 font-medium rounded-xl transition-all border-2",
              isChatOpen ? "bg-accent-blue/10 text-accent-blue border-accent-blue/20" : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
            )}
          >
            <Sparkles size={18} className={isChatOpen ? "text-accent-blue" : "text-slate-400"} />
            Ask AI
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Loader2 className="animate-spin mb-4 text-accent-blue" size={32} />
              <p>Searching repository...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="max-w-4xl space-y-4">
              {results.map((res, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getIconForType(res.type)}
                      <span className="font-semibold text-slate-800 text-sm">{res.title}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                      Score: {(res.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  {res.path && <div className="text-xs font-mono text-slate-400 mb-2 truncate">{res.path}</div>}
                  <div className="text-sm text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">
                    {res.content}
                  </div>
                </div>
              ))}
            </div>
          ) : debouncedQuery ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <p>No results found for "{debouncedQuery}"</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Search across your entire repository</p>
              <p className="text-sm mt-2 max-w-md text-center">Use natural language to find code snippets, understand architecture, or locate specific PRs and commits.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Sidebar */}
      {isChatOpen && (
        <div className="w-96 border-l border-slate-200 bg-white flex flex-col shadow-xl absolute right-0 top-0 bottom-0 z-20 animate-in slide-in-from-right-8 duration-300">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold flex items-center gap-2 text-slate-800">
              <Sparkles size={16} className="text-accent-blue" /> Ask AI
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
            {chatMessages.length === 0 ? (
              <div className="text-center text-slate-500 mt-10 text-sm">
                <Sparkles size={32} className="mx-auto mb-3 opacity-20" />
                <p>Ask a question about your codebase.</p>
                <p className="text-xs mt-2">I will search the repository context to provide accurate answers.</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className={clsx("flex gap-3 text-sm", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-accent-blue text-white" : "bg-emerald-100 text-emerald-600")}>
                    {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                  </div>
                  <div className={clsx("p-3 rounded-xl max-w-[80%]", msg.role === 'user' ? "bg-accent-blue text-white" : "bg-white border border-slate-200 text-slate-700 shadow-sm")}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isChatLoading && (
              <div className="flex gap-3 text-sm flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
                  <Sparkles size={14} />
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce delay-75"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleAskAI} className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about this repo..."
                disabled={isChatLoading}
                className="w-full pl-4 pr-10 py-3 bg-slate-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-accent-blue focus:outline-none transition-all text-sm disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={isChatLoading || !chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-accent-blue disabled:opacity-50 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
