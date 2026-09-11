"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, GitPullRequest, GitBranch, CircleDot, BookOpen, ShieldCheck, FileCode2, Network } from "lucide-react";

/** The connected-context composition: PR → code → DevHub → architecture / ADR / docs. */
function ContextGraph() {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.25)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
        </div>
        <span className="font-mono text-[11px] text-slate-400">devhub · live context</span>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> tracking
        </span>
      </div>

      <div className="p-5">
        {/* PR card */}
        <div className="mt-1">
          <div className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <GitPullRequest className="h-4 w-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-slate-400">PR #238</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500">main → feature/payment-timeout</span>
                </div>
                <div className="mt-1 text-[14px] font-semibold text-slate-900">Fix payment timeout handling</div>
                <div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-slate-400">
                  <span>commit 7f3a2d</span>
                  <span><span className="text-emerald-600">+184</span> <span className="text-red-600">−76</span></span>
                </div>
              </div>
            </div>
            <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">2 findings</span>
          </div>
        </div>

        {/* connector */}
        <div className="flex h-7 flex-col items-center">
          <span className="h-full w-px border-l border-dashed border-slate-300" />
        </div>

        {/* floating impact chip */}
        <div className="relative -my-2 z-10 flex justify-center">
          <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[10.5px] font-medium text-orange-600">
            Impact detected · 2 documents affected
          </span>
        </div>

        {/* DevHub node */}
        <div className="relative my-4">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-3 py-1.5 shadow-sm text-white">
            <Network className="h-3.5 w-3.5 text-slate-200" />
            <span className="text-[12.5px] font-semibold tracking-tight">DevHub</span>
          </div>
          <div className="mt-3 hidden items-center justify-center gap-2 sm:flex">
            <span className="h-px w-8 bg-slate-200" />
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="h-px w-8 bg-slate-200" />
          </div>
        </div>

        {/* branches */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            {
              icon: <ShieldCheck className="h-3.5 w-3.5" />,
              label: "Architecture",
              status: "No conflict",
              statusCls: "bg-emerald-50 text-emerald-600 border-emerald-200",
            },
            {
              icon: <FileCode2 className="h-3.5 w-3.5" />,
              label: "ADR-027",
              status: "Related",
              statusCls: "bg-blue-50 text-blue-700 border-blue-200",
            },
            {
              icon: <BookOpen className="h-3.5 w-3.5" />,
              label: "Documentation",
              status: "Needs update",
              statusCls: "bg-amber-50 text-amber-600 border-amber-200",
            },
          ].map((c) => (
            <div key={c.label} className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="flex items-center gap-1.5 text-slate-500">{c.icon}<span className="font-mono text-[10.5px] font-medium">{c.label}</span></div>
              <span className={`w-fit rounded px-1.5 py-0.5 text-[10px] font-semibold ${c.statusCls}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative border-b border-slate-200/70 px-6 pt-20 pb-16 md:px-12 md:pt-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span className="h-px w-6 bg-slate-400" />
              Engineering intelligence for GitHub
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-6 max-w-[15ch] text-[44px] font-bold leading-[1.04] tracking-[-0.02em] text-slate-900 sm:text-[56px] lg:text-[72px]"
          >
            Understand what changed, why it changed, and what it affects.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-slate-600 md:text-[18px]"
          >
            DevHub connects pull requests, issues, architecture, decisions, and project documentation so your
            engineering context doesn&rsquo;t get lost as the codebase evolves.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/sign-in"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-black"
            >
              Connect GitHub
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#context"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-3 text-[15px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              See how it works
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-slate-400"
          >
            <span className="flex items-center gap-1.5"><GitBranch className="h-3.5 w-3.5" />GitHub</span>
            <span className="flex items-center gap-1.5"><CircleDot className="h-3.5 w-3.5" />PRs &amp; issues</span>
            <span className="flex items-center gap-1.5"><Network className="h-3.5 w-3.5" />Architecture</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />Decisions</span>
          </motion.div>
        </div>

        {/* Composition */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ContextGraph />
        </motion.div>
      </div>
    </section>
  );
}