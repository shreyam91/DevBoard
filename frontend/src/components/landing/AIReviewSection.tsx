"use client";

import { ShieldCheck, Network, BookOpen, Check, FileCode2 } from "lucide-react";
import Reveal from "./Reveal";

export default function AIReviewSection() {
  return (
    <section className="border-b border-slate-200/70 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span className="h-px w-6 bg-slate-400" />
              AI code review
            </div>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-0.02em] text-slate-900 md:text-[44px]">
              Reviewed where you review.
            </h2>
            <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-slate-600">
              Findings land on the exact file and line — with confidence and a concrete suggestion — alongside the
              architecture and docs each change affects.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Review panel */}
          <Reveal className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent-blue" />
                <span className="text-[13px] font-semibold text-slate-900">AI Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11.5px] text-slate-400">PR #238</span>
                <span className="text-[12.5px] font-medium text-slate-900">Fix payment timeout handling</span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between rounded-md border border-orange-200 bg-orange-50 px-3 py-1.5">
                <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-orange-600">
                  <span className="h-2 w-2 rounded-full bg-orange-500" /> High
                </span>
                <span className="font-mono text-[11px] text-slate-500">PaymentService.ts · Line 87</span>
              </div>

              <h3 className="mt-4 text-[15px] font-semibold text-slate-900">Potential duplicate payment</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">
                The retry path may execute the payment request again after the provider has already processed the
                original request.
              </p>

              <div className="mt-4 rounded-lg bg-slate-50 p-3 font-mono text-[12px] text-slate-500">
                <span className="text-slate-800">paymentService.pay(order)</span>
                <span className="text-slate-400"> · idempotencyKey=</span>
                <span className="text-amber-600">undefined</span>
                <span className="text-red-600">{"  // retry can double-charge"}</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-400">Confidence 94%</span>
                <button className="rounded-md border border-slate-200 px-3 py-1.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                  View code
                </button>
              </div>
            </div>
          </Reveal>

          {/* Architecture + documentation panels */}
          <div className="flex flex-col gap-6">
            <Reveal delay={0.05} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-3">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-slate-500" />
                  <span className="text-[13px] font-semibold text-slate-900">Architecture</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-[14px] font-semibold text-emerald-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100"><Check className="h-3 w-3" /></span>
                  No conflict detected
                </div>
                <div className="mt-3 flex items-center gap-2 font-mono text-[11.5px] text-slate-500">
                  <FileCode2 className="h-3.5 w-3.5" /> ADR-012 · Payment service retry policy
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700"><Check className="h-3 w-3" /> consistent</span>
                  <span>with current baseline</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  <span className="text-[13px] font-semibold text-slate-900">Documentation</span>
                </div>
              </div>
              <div className="p-5">
                <div className="text-[14px] font-semibold text-slate-900">2 documents may be affected</div>
                <div className="mt-3 space-y-1.5">
                  {["Architecture", "Technical Specification"].map((d) => (
                    <div key={d} className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                      <span className="text-[13px] font-medium text-slate-800">{d}</span>
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-600">needs update</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}