"use client";

import {
  Box,
  GitPullRequest,
  FileCode2,
  Network,
  FileText,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Reveal from "./Reveal";

const FLOW = [
  {
    icon: Box,
    tag: "Issue #1046",
    title: "Duplicate payment on retry",
    meta: "linked from PR",
    note: "Why is this change needed?",
  },
  {
    icon: GitPullRequest,
    tag: "PR #238",
    title: "Fix payment timeout",
    meta: "main → feature/payment-timeout · +184 −76",
    note: "What is being changed?",
  },
  {
    icon: FileCode2,
    tag: "Code changes",
    title: "PaymentService.ts · TimeoutService.ts",
    meta: "9 files · 1 library added",
    note: "What actually changed?",
  },
  {
    icon: Network,
    tag: "Architecture",
    title: "Payment retry flow",
    meta: "payment → idempotency",
    note: "Does it fit the system?",
  },
  {
    icon: FileText,
    tag: "ADR-020",
    title: "Payment service retry policy",
    meta: "accepted · 2026-08",
    note: "Does it conflict with a decision?",
  },
  {
    icon: BookOpen,
    tag: "Documentation",
    title: "Technical Specification",
    meta: "2 docs · needs update",
    note: "What needs to be updated?",
  },
];

export default function FromContext() {
  return (
    <section
      id="how-it-works"
      className="border-b border-slate-200/70 bg-white px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span className="h-px w-6 bg-slate-400" />
              From change to context
              <span className="h-px w-6 bg-slate-400" />
            </div>

            <h2 className="mt-4 text-[36px] font-bold leading-[1.05] tracking-[-0.03em] text-slate-900 md:text-[48px]">
              A pull request is more
              <br className="hidden sm:block" />
              <span className="text-slate-400"> than a diff.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-[620px] text-[16px] leading-7 text-slate-600 md:text-[17px]">
              Code changes don't happen in isolation. DevHub traces every
              change across the issue, code, architecture, decisions, and
              documentation that give it meaning.
            </p>
          </div>
        </Reveal>

        {/* Vertical timeline */}
        <div className="relative mx-auto mt-20 max-w-[850px]">
          {/* Timeline rail */}
          <div className="absolute bottom-8 left-5 top-8 w-px bg-slate-200 md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-10 md:space-y-14">
            {FLOW.map((step, i) => {
              const Icon = step.icon;
              const isRight = i % 2 === 0;

              return (
                <Reveal key={step.tag} delay={i * 0.06}>
                  <div className="relative grid grid-cols-[40px_1fr] gap-5 md:grid-cols-[1fr_56px_1fr] md:gap-0">
                    {/* Left content */}
                    <div
                      className={`hidden md:block ${
                        isRight
                          ? "text-right pr-10"
                          : "invisible"
                      }`}
                    >
                      {isRight && (
                        <TimelineContent
                          step={step}
                          align="right"
                        />
                      )}
                    </div>

                    {/* Node */}
                    <div className="relative z-10 flex justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Right content */}
                    <div className="md:pl-10">
                      {isRight ? (
                        <div className="md:hidden">
                          <TimelineContent step={step} />
                        </div>
                      ) : (
                        <TimelineContent step={step} />
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Bottom statement */}
        <Reveal delay={0.35}>
          <div className="mx-auto mt-20 max-w-[850px] border-t border-slate-200 pt-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-900">
                  One change. Six layers of context.
                </p>
                <p className="mt-1 text-[13px] text-slate-500">
                  Understand not only what changed, but why it matters.
                </p>
              </div>

              {/* <a
                href="#context"
                className="group inline-flex shrink-0 items-center gap-2 text-[13px] font-medium text-slate-700 transition-colors hover:text-slate-950"
              >
                Explore the context layer
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-950" />
              </a> */}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TimelineContent({
  step,
  align = "left",
}: {
  step: (typeof FLOW)[number];
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
        {step.tag}
      </div>

      <h3 className="mt-1 text-[15px] font-semibold leading-5 text-slate-900">
        {step.title}
      </h3>

      <p className="mt-1.5 font-mono text-[10.5px] leading-5 text-slate-400">
        {step.meta}
      </p>

      <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
        {step.note}
      </p>
    </div>
  );
}
