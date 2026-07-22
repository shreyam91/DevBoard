import React from 'react';
import { FileCode, Download, ExternalLink, RefreshCw } from 'lucide-react';

export default function ArchitecturePage({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      {/* Top bar */}
      <header className="h-[64px] bg-white/60 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">ARCHITECTURE.md</h2>
          <div className="w-px h-4 bg-slate-300"></div>
          <span className="text-[13px] font-medium text-slate-500">Auto-generated from your decisions</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-[36px] px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm rounded-lg flex items-center gap-2 transition-all group">
            <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="text-[13px] font-semibold text-slate-700">Regenerate</span>
          </button>
          <button className="h-[36px] px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm rounded-lg flex items-center gap-2 transition-all group">
            <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="text-[13px] font-semibold text-slate-700">Download</span>
          </button>
          <button className="h-[36px] px-4 bg-accent-blue hover:bg-accent-blue/90 shadow-sm rounded-lg flex items-center gap-2 transition-all group">
            <ExternalLink className="w-4 h-4 text-white/90 group-hover:text-white" />
            <span className="text-[13px] font-semibold text-white">Open in GitHub</span>
          </button>
        </div>
      </header>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-[850px] mx-auto bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-3">
            <FileCode className="w-5 h-5 text-slate-400" />
            <span className="text-[13px] font-mono text-slate-600 font-semibold">ARCHITECTURE.md</span>
          </div>

          <article className="p-8 md:p-12 max-w-none text-slate-700 text-[15px] leading-relaxed">
            <h1 className="text-[24px] font-bold text-slate-900 tracking-tight mb-4">Architecture Decision Record (ADR)</h1>
            <p className="text-slate-500 text-[16px] mb-8">
              This document serves as the single source of truth for architectural decisions made in the <strong className="text-slate-900">{repoId}</strong> repository. It is automatically maintained by DevBoard based on pull request analysis and confirmed decisions.
            </p>

            <hr className="border-slate-200 my-8" />

            <h2 className="text-[18px] font-bold text-slate-900 tracking-tight mt-8 mb-4">1. System Overview</h2>
            <p className="mb-4">
              The system is structured as a monolithic frontend utilizing Next.js (App Router) to communicate with a set of modular backend services. The primary goal is to ensure high cohesiveness for UI components while allowing the backend to scale independently.
            </p>

            <h3 className="text-[15px] font-bold text-slate-900 mt-6 mb-3">Core Technologies</h3>
            <ul className="list-disc pl-5 space-y-2 mb-8">
              <li><strong className="text-slate-900">Frontend:</strong> React, Next.js, Tailwind CSS, Framer Motion</li>
              <li><strong className="text-slate-900">Backend:</strong> Node.js, Prisma ORM</li>
              <li><strong className="text-slate-900">Database:</strong> PostgreSQL (via Supabase)</li>
            </ul>

            <hr className="border-slate-200 my-8" />

            <h2 className="text-[18px] font-bold text-slate-900 tracking-tight mt-8 mb-6">2. Architectural Decisions</h2>

            <h3 className="text-[15px] font-bold text-slate-900 mt-6 mb-3">2.1 Authentication Provider (Supabase vs. NextAuth)</h3>
            <p className="mb-3"><strong>Status:</strong> <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ml-2">Accepted</span></p>
            <p className="mb-3">
              <strong className="text-slate-900">Context:</strong> We needed a scalable authentication provider that supports deep database integration and Row Level Security (RLS).
            </p>
            <p className="mb-8">
              <strong className="text-slate-900">Decision:</strong> We opted for Supabase Auth because it tightly integrates with our Postgres instance, allowing us to utilize native RLS policies for multi-tenant data isolation. NextAuth was evaluated but required excessive custom adapters for our specific multi-tenant requirements.
            </p>

            <h3 className="text-[15px] font-bold text-slate-900 mt-6 mb-3">2.2 State Management (Zustand vs. Redux)</h3>
            <p className="mb-3"><strong>Status:</strong> <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ml-2">Accepted</span></p>
            <p className="mb-3">
              <strong className="text-slate-900">Context:</strong> The frontend application requires global state management for user sessions and caching repository metrics.
            </p>
            <p className="mb-8">
              <strong className="text-slate-900">Decision:</strong> We adopted <code className="text-[13px] text-accent-red bg-accent-red/5 px-1.5 py-0.5 rounded-md font-mono">zustand</code> for global state management. It provides a smaller bundle size, less boilerplate, and a simpler mental model compared to Redux Toolkit.
            </p>

            <hr className="border-slate-200 my-8" />
            
            <h2 className="text-[18px] font-bold text-slate-900 tracking-tight mt-8 mb-4">3. Cross-Cutting Concerns</h2>
            <h3 className="text-[15px] font-bold text-slate-900 mt-6 mb-3">Security</h3>
            <p className="mb-4">
              All API routes are protected via edge middleware. Passwords and API tokens are heavily encrypted at rest. We utilize GitHub OAuth scoped exclusively to <code className="text-[13px] text-accent-red bg-accent-red/5 px-1.5 py-0.5 rounded-md font-mono">repo:read</code> to minimize attack vectors.
            </p>

          </article>
        </div>
      </div>
    </div>
  );
}
