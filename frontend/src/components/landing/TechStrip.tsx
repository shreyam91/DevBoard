"use client";

import Reveal from "./Reveal";

const TECH = ["GitHub", "PostgreSQL", "Redis", "BullMQ", "pgvector"];

export default function TechStrip() {
  return (
    <section className="border-b border-slate-200/70 px-6 py-14 md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="max-w-md text-[13px] uppercase tracking-wider text-slate-500">
              Built around your existing engineering workflow
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {TECH.map((t) => (
                <span key={t} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 font-mono text-[12.5px] text-slate-600">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}