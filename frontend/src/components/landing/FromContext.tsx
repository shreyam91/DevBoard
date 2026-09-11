"use client";

import { ArrowDown } from "lucide-react";
import Reveal from "./Reveal";

const FLOW = [
  { tag: "PR #238", title: "Fix payment timeout", meta: "main → feature/payment-timeout · +184 −76", note: "What is being changed" },
  { tag: "Issue #1046", title: "Duplicate payment on retry", meta: "linked from PR", note: "Why is this change needed?" },
  { tag: "Code changes", title: "PaymentService.ts · TimeoutService.ts", meta: "9 files · 1 library added", note: "What actually changed" },
  { tag: "Architecture", title: "Payment retry flow", meta: "node: payment → idempotency", note: "Does it fit the system?" },
  { tag: "ADR-020", title: "Payment service retry policy", meta: "accepted · 2026-08", note: "Does it conflict with a decision?" },
  { tag: "Documentation", title: "Technical Specification", meta: "2 docs · status: needs update", note: "What needs to be updated" },
];

export default function FromContext() {
  return (
    <section id="context" className="border-b border-slate-200/70 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span className="h-px w-6 bg-slate-400" />
              From change to context
            </div>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-0.02em] text-slate-900 md:text-[44px]">
              A pull request is more than a diff.
            </h2>
            <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-slate-600">
              Each change is traced across the issue that motivated it, the code that implements it, and the
              architecture, decisions, and docs it touches.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-14 max-w-[560px]">
          {FLOW.map((step, i) => (
            <Reveal key={step.tag} delay={i * 0.05}>
              <div className="relative flex gap-5">
                {/* connector rail */}
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-white" />
                  {i < FLOW.length - 1 && <div className="my-1 h-9 w-px bg-slate-200" />}
                </div>
                <div className="pb-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                    <span className="font-mono text-[11.5px] font-semibold text-slate-400">{step.tag}</span>
                    <h3 className="text-[15px] font-semibold text-slate-900">{step.title}</h3>
                  </div>
                  <div className="mt-0.5 flex flex-col gap-1 sm:flex-row sm:gap-3">
                    <span className="font-mono text-[11.5px] text-slate-400">{step.meta}</span>
                    <span className="text-[12px] text-slate-500">{step.note}</span>
                  </div>
                </div>
              </div>
              {i < FLOW.length - 1 && (
                <div className="my-1 flex justify-center">
                  <ArrowDown className="h-4 w-4 text-slate-300" />
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}