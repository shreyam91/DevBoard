"use client";

import { Check, AlertTriangle, FileText } from "lucide-react";
import Reveal from "./Reveal";

const DOCS = [
  { name: "Architecture", status: "current", icon: <Network2 /> },
  { name: "PRD", status: "current", icon: <FileText /> },
  { name: "SRS", status: "current", icon: <FileText /> },
  { name: "Technical Specification", status: "stale", icon: <FileText /> },
  { name: "Deployment", status: "stale", icon: <FileText /> },
  { name: "ADR-012", status: "current", icon: <FileText /> },
];

export default function LivingDocs() {
  return (
    <section className="border-b border-slate-200/70 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          {/* Foundation statement */}
          <Reveal>
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span className="h-px w-6 bg-slate-400" />
              Project knowledge
            </div>
            <h2 className="mt-3 max-w-[20ch] text-[34px] font-bold leading-[1.08] tracking-[-0.02em] text-slate-900 md:text-[44px]">
              When the code changes, know what else changed.
            </h2>
            <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-slate-600">
              Every document is checked against the code that implements it. Stale specs and missing updates surface
              themselves — the foundation for living documentation.
            </p>
            <div className="mt-6 text-[13px] text-slate-400">Documentation tracked alongside the code that changes them.</div>
          </Reveal>

          {/* Table */}
          <Reveal delay={0.08} className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3">
              <span className="text-[13px] font-semibold text-slate-900">Project documentation status</span>
              <span className="ml-2 font-mono text-[11px] text-slate-400">preview</span>
            </div>
            <div className="divide-y divide-slate-100">
              {DOCS.map((d, i) => {
                const stale = d.status === "stale";
                return (
                  <div key={d.name} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-slate-400">{d.icon}</span>
                    <span className="flex-1 text-[13.5px] font-medium text-slate-800">{d.name}</span>
                    <span className={`font-mono text-[11.5px] ${stale ? "text-amber-600" : "text-slate-400"}`}>
                      v{i + 2}
                    </span>
                    {stale ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11.5px] font-semibold text-amber-600">
                        <AlertTriangle className="h-3 w-3" /> Needs update
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-700">
                        <Check className="h-3 w-3" /> Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Network2({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8" />
    </svg>
  );
}