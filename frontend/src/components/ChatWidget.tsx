'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { MessageSquareText, X, ArrowUp, Box, User } from 'lucide-react';

/* ------------------------------------------------------------------
   Floating Ask DevHub widget — the bottom-right chat tile. Lighter
   than the full /chat page: a single continuous conversation, a repo
   select, sources, and a few suggested quick questions.
   ------------------------------------------------------------------ */

interface RepoOption { id: string; full_name: string; name: string }
interface Source { kind: string; title: string; href: string; detail?: string }
interface Msg { id: string; role: 'user' | 'assistant'; content: string; sources?: Source[] }

const QUICK_QUESTIONS = [
  'Why did we choose Redis for background jobs?',
  'What is the payment architecture?',
  'How does the PR review pipeline work?',
];

function SourcePill({ source, index }: { source: Source; index: number }) {
  const label =
    source.kind === 'adr'
      ? `ADR-${source.title.replace(/\D/g, '').padStart(3, '0')}`
      : source.kind === 'pr'
        ? `PR #${source.detail ?? source.title}`
        : source.kind === 'architecture'
          ? 'Architecture'
          : source.kind === 'file'
            ? source.title.split('/').pop() ?? source.title
            : source.title;
  return (
    <a href={source.href} target="_blank" rel="noopener noreferrer" className="chat-source" title={source.detail ?? source.title}>
      <span className="chat-source-nr">[{index}]</span>
      <span className="chat-source-label">{label}</span>
    </a>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [repoId, setRepoId] = useState<string>('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const userPhoto = user?.imageUrl ?? '';
  const sessionIdRef = useRef<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const loadRepos = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/repos');
      if (res.ok) {
        const data = await res.json();
        setRepos(data.repos ?? []);
        // Preselect the first repo only if none chosen yet.
        setRepoId((cur) => cur || data.repos[0]?.id || '');
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (open && repos.length === 0) loadRepos();
  }, [open, repos.length, loadRepos]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(
    async (questionOverride?: string) => {
      if (!repoId) return;
      const q = (questionOverride ?? input).trim();
      if (!q || loading) return;
      setInput('');

      const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', content: q };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoId, question: q, sessionId: sessionIdRef.current }),
        });
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        sessionIdRef.current = data.sessionId ?? sessionIdRef.current;
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', content: data.answer, sources: data.sources },
        ]);
      } catch {
        setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'assistant', content: 'Something went wrong. Please try again.' }]);
      } finally {
        setLoading(false);
      }
    },
    [repoId, input, loading],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-widget-panel">
          {/* Header */}
          <div className="chat-widget-header">
            <MessageSquareText className="h-4 w-4 text-[var(--accent)]" />
            <span className="chat-widget-title">Ask DevHub</span>
            <select
              className="chat-widget-repo"
              value={repoId}
              onChange={(e) => {
                setRepoId(e.target.value);
                setMessages([]);
                sessionIdRef.current = null;
              }}
              disabled={repos.length === 0}
              title="Repository to ground answers in"
            >
              {repos.length === 0 && <option value="">No repositories</option>}
              {repos.map((r) => (
                <option key={r.id} value={r.id}>{r.full_name}</option>
              ))}
            </select>
            <button className="chat-widget-close" onClick={() => setOpen(false)} title="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-widget-messages" ref={messagesRef}>
            {messages.length === 0 ? (
              <div className="chat-widget-empty">
                <div style={{ fontSize: 26 }}>💬</div>
                {repoId ? (
                  <>
                    <p>Ask anything about this project. Answers are grounded in its ADRs, architecture docs, PRs, and code.</p>
                    {QUICK_QUESTIONS.map((q) => (
                      <button key={q} className="chat-widget-q" onClick={() => send(q)}>{q}</button>
                    ))}
                  </>
                ) : (
                  <p>Select a repository to start asking.</p>
                )}
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`chat-msg chat-msg-${m.role}`}>
                  <div className="chat-msg-avatar">
                    {m.role === 'user'
                      ? userPhoto
                        ? <img src={userPhoto} alt="" referrerPolicy="no-referrer" />
                        : <User size={15} />
                      : <Box size={15} />}
                  </div>
                  <div className="chat-msg-body">
                    <div className="chat-msg-content">
                      {m.content.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < m.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    {m.sources && m.sources.length > 0 && (
                      <div className="chat-sources">
                        <span className="chat-sources-label">Sources:</span>
                        {m.sources.map((s, i) => <SourcePill key={i} source={s} index={i + 1} />)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="chat-msg chat-msg-assistant">
                <div className="chat-msg-avatar"><Box size={15} /></div>
                <div className="chat-msg-body">
                  <div className="chat-msg-content chat-typing">
                    <span className="chat-typing-dot" /><span className="chat-typing-dot" /><span className="chat-typing-dot" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="chat-widget-inputwrap">
            <textarea
              className="chat-widget-input"
              rows={1}
              placeholder={repoId ? 'Ask a question…' : 'Select a repository…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading || !repoId}
            />
            <button className="chat-widget-send" onClick={() => send()} disabled={loading || !input.trim() || !repoId} title="Send">
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bubble */}
      <button className="chat-widget-bubble" onClick={() => setOpen((v) => !v)} title={open ? 'Close chat' : 'Open Ask DevHub'}>
        {open ? <X className="h-6 w-6" /> : <MessageSquareText className="h-6 w-6" />}
      </button>
    </div>
  );
}