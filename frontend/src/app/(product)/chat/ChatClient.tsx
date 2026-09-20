'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ChevronDown, Box, User } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RepoOption {
  id: string;
  full_name: string;
  name: string;
  health_status?: string | null;
}

interface Source {
  kind: string;
  title: string;
  href: string;
  detail?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  createdAt: string;
}

interface Session {
  id: string;
  title: string;
  created_at: string;
}

interface ChatResponse {
  answer: string;
  sources: Source[];
  sessionId: string;
  emptyContext: boolean;
}

/* ------------------------------------------------------------------ */
/*  Suggested questions for the empty state                            */
/* ------------------------------------------------------------------ */

const SUGGESTIONS = [
  'Why did we choose Redis for background jobs?',
  'What is the payment architecture?',
  'How does the PR review pipeline work?',
  'What changed with authentication?',
  'When should we use an ADR?',
  'What is the request flow through the system?',
];

/* ------------------------------------------------------------------ */
/*  Source pill                                                        */
/* ------------------------------------------------------------------ */

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
    <a
      href={source.href}
      target="_blank"
      rel="noopener noreferrer"
      className="chat-source"
      title={source.detail ?? source.title}
    >
      <span className="chat-source-nr">[{index}]</span>
      <span className="chat-source-label">{label}</span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component — global, with a real-repo picker                   */
/* ------------------------------------------------------------------ */

export default function ChatClient({
  initialRepos,
  initialQuery,
  initialRepoId,
}: {
  initialRepos: RepoOption[];
  initialQuery?: string;
  initialRepoId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const userPhoto = user?.imageUrl ?? '';

  const [repos, setRepos] = useState<RepoOption[]>(initialRepos);
  const [repoId, setRepoId] = useState<string | null>(initialRepoId ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectingRepo, setSelectingRepo] = useState(repos.length === 0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const activeRepo = useMemo(() => repos.find((r) => r.id === repoId) ?? null, [repos, repoId]);

  /* ---- Load repos (refresh in case server list is stale) ---- */
  const loadRepos = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/repos');
      if (res.ok) {
        const data = await res.json();
        setRepos(data.repos ?? []);
        setSelectingRepo(false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadRepos();
  }, [loadRepos]);

  /* ---- Load sessions once a repo is selected ---- */
  const loadSessions = useCallback(async (rid: string) => {
    try {
      const res = await fetch(`/api/chat?repoId=${rid}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions ?? []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (repoId) loadSessions(repoId);
    else setSessions([]);
  }, [repoId, loadSessions]);

  /* ---- Load messages when session changes ---- */
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (activeSessionId) loadMessages(activeSessionId);
    else setMessages([]);
  }, [activeSessionId, loadMessages]);

  /* ---- Auto-scroll ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---- Auto-focus ---- */
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeSessionId, repoId]);

  /* ---- Auto-submit initial query once repo resolves ---- */
  const submittedInitial = useRef(false);
  useEffect(() => {
    if (initialQuery && repoId && !submittedInitial.current && !loading) {
      submittedInitial.current = true;
      setInput(initialQuery);
      const t = setTimeout(() => handleSubmit(initialQuery), 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoId, initialQuery, loading]);

  /* ---- Close picker on outside click ---- */
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  /* ---- Select repo ---- */
  const selectRepo = (id: string) => {
    setRepoId(id);
    setPickerOpen(false);
    setActiveSessionId(null);
    setMessages([]);
    // Keep URL in sync so the selection is shareable.
    const params = new URLSearchParams(searchParams.toString());
    params.set('repo', id);
    router.replace(`/chat?${params.toString()}`, { scroll: false });
  };

  /* ---- Send question ---- */
  const handleSubmit = useCallback(
    async (questionOverride?: string) => {
      if (!repoId) return;
      const q = (questionOverride ?? input).trim();
      if (!q || loading) return;

      setInput('');
      setLoading(true);
      setMessages((prev) => [
        ...prev,
        { id: `temp-${Date.now()}`, role: 'user', content: q, createdAt: new Date().toISOString() },
      ]);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoId, question: q, sessionId: activeSessionId }),
        });
        if (!res.ok) throw new Error('Request failed');
        const data: ChatResponse = await res.json();

        setMessages((prev) => [
          ...prev,
          { id: `msg-${Date.now()}`, role: 'assistant', content: data.answer, sources: data.sources, createdAt: new Date().toISOString() },
        ]);

        if (data.sessionId !== activeSessionId) {
          setActiveSessionId(data.sessionId);
          loadSessions(repoId);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: 'assistant', content: 'Something went wrong. Please try again.', createdAt: new Date().toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [repoId, input, loading, activeSessionId, loadSessions],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const newConversation = () => {
    setActiveSessionId(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  const triggerIngestion = async () => {
    if (!repoId) return;
    setSelectingRepo(true);
    try {
      await fetch('/api/chat/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId }),
      });
    } catch {}
    setSelectingRepo(false);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const showEmptyState = messages.length === 0 && !loading;

  return (
    <div className="chat-layout">
      {/* ---- Sidebar: conversations ---- */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <button className="btn btn-primary btn-sm" onClick={newConversation} disabled={!repoId}>
            + New
          </button>
          <button className="btn btn-sm" onClick={triggerIngestion} disabled={!repoId || selectingRepo} title="Sync project data for better answers">
            {selectingRepo ? 'Syncing…' : '⟳ Sync'}
          </button>
        </div>

        <p className="label px-3 pt-3">Conversations</p>
        <div className="chat-sidebar-list">
          {sessions.length === 0 && <p className="chat-sidebar-empty">No conversations yet</p>}
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`chat-sidebar-item ${s.id === activeSessionId ? 'active' : ''}`}
              onClick={() => setActiveSessionId(s.id)}
            >
              <span className="chat-sidebar-item-title">{s.title}</span>
              <span className="chat-sidebar-item-time">{formatTime(s.created_at)}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ---- Main ---- */}
      <main className="chat-main">
        <div className="chat-main-header">
          {/* Repo picker */}
          <div className="chat-repo-picker" ref={pickerRef}>
            <button
              className="chat-repo-trigger"
              onClick={() => setPickerOpen((v) => !v)}
              disabled={repos.length === 0}
            >
              <span className="chat-repo-dot" />
              <span className="chat-repo-name">{activeRepo ? activeRepo.full_name : 'Select a repository'}</span>
              <ChevronDown className="chat-repo-chevron h-4 w-4" />
            </button>
            {pickerOpen && (
              <div className="chat-repo-menu">
                {repos.length === 0 && <div className="chat-repo-menu-empty">No connected repositories</div>}
                {repos.map((r) => (
                  <button
                    key={r.id}
                    className={`chat-repo-option ${r.id === repoId ? 'active' : ''}`}
                    onClick={() => selectRepo(r.id)}
                  >
                    <span className="mono">{r.full_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="chat-main-repo">
            {activeRepo ? `${activeRepo.name} knowledge base` : 'Ask DevHub'}
          </span>
        </div>

        <div className="chat-messages">
          {showEmptyState ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <h3>Ask anything about your project</h3>
              <p className="chat-empty-sub">
                {repoId
                  ? `Answers are grounded in ${activeRepo?.full_name ?? 'this project'}'s architecture docs, ADRs, pull requests, issues, and code.`
                  : 'Pick a repository above to ground answers in its code, decisions, and docs.'}
              </p>
              {repoId && (
                <div className="chat-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="chat-suggestion" onClick={() => { setInput(s); handleSubmit(s); }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-msg chat-msg-${msg.role}`}>
                  <div className="chat-msg-avatar">
                    {msg.role === 'user'
                      ? userPhoto
                        ? <img src={userPhoto} alt="" referrerPolicy="no-referrer" />
                        : <User size={15} />
                      : <Box size={15} />}
                  </div>
                  <div className="chat-msg-body">
                    <div className="chat-msg-content">
                      {msg.content.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < msg.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="chat-sources">
                        <span className="chat-sources-label">Sources:</span>
                        {msg.sources.map((s, i) => <SourcePill key={i} source={s} index={i + 1} />)}
                      </div>
                    )}
                    <span className="chat-msg-time">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="chat-msg chat-msg-assistant">
                  <div className="chat-msg-avatar"><Box size={15} /></div>
                  <div className="chat-msg-body">
                    <div className="chat-msg-content chat-typing">
                      <span className="chat-typing-dot" />
                      <span className="chat-typing-dot" />
                      <span className="chat-typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="chat-input-wrap">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={repoId ? 'Ask a question about this project…' : 'Select a repository first…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading || !repoId}
          />
          <button className="chat-send" onClick={() => handleSubmit()} disabled={loading || !input.trim() || !repoId} title="Send">
            ↑
          </button>
        </div>
      </main>
    </div>
  );
}