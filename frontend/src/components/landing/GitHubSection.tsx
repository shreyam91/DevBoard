"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, GitBranch } from "lucide-react";
import Reveal from "./Reveal";

const METRICS = [
  { label: "Repositories", value: "12" },
  { label: "Pull Requests", value: "184" },
  { label: "Issues", value: "392" },
  { label: "Architectural docs", value: "28" },
];

const STAGES = ["Pull requests", "Issues", "Commits"];

export default function GitHubSection() {
  return (
    <section className="border-b border-slate-200/70 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            <span className="h-px w-6 bg-slate-400" />
            Connect your project
          </div>
          <h2 className="mt-3 max-w-[20ch] text-[34px] font-bold leading-[1.08] tracking-[-0.02em] text-slate-900 md:text-[44px]">
            Your GitHub project, in one connected view.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          {/* GitHub source panel (illustrative preview) */}
          <Reveal className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-slate-500" />
                <span className="text-[13px] font-semibold text-slate-900">GitHub</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">preview</span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-100">
              {METRICS.map((m) => (
                <div key={m.label} className="bg-white p-5">
                  <div className="font-mono text-[24px] font-semibold text-slate-900">{m.value}</div>
                  <div className="mt-0.5 text-[12.5px] text-slate-500">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="p-5 text-[12.5px] leading-relaxed text-slate-500">
              Source data streams in from the repositories, PRs, and issues you already work in.
            </div>
          </Reveal>

          {/* Relationship */}
          <Reveal delay={0.08} className="flex flex-col">
            <div className="flex flex-1 flex-col justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700"><GitBranch className="h-4 w-4" /></span>
                <div>
                  <div className="text-[13.5px] font-semibold text-slate-900">GitHub</div>
                  <div className="font-mono text-[11px] text-slate-400">{STAGES.join(" · ")}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <ArrowDown className="h-4 w-4 text-slate-300" />
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white"><span className="text-[12px] font-bold">DH</span></span>
                <div>
                  <div className="text-[13.5px] font-semibold text-slate-900">DevHub</div>
                  <div className="font-mono text-[11px] text-slate-400">reads · reviews · tracks</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <ArrowDown className="h-4 w-4 text-slate-300" />
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-accent-blue bg-accent-blue/5 text-accent-blue"><ArrowRight className="h-4 w-4" /></span>
                <div>
                  <div className="text-[13.5px] font-semibold text-slate-900">Project intelligence</div>
                  <div className="font-mono text-[11px] text-slate-400">architecture · decisions · docs</div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <Link
                  href="/sign-in"
                  className="group inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-black"
                >
                  Connect GitHub
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}