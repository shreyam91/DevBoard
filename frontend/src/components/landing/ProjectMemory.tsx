"use client";

import { FileText, GitPullRequest, FileCode2, BookOpen } from "lucide-react";

export default function ProjectMemory() {
  return (
    <section id="architecture" className="w-full bg-[#FAFAFA] py-32 border-t border-slate-200 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Copy */}
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-6 leading-[1.2]">
              Your repository shouldn't forget what your team already decided.
            </h2>
            <p className="text-[16px] leading-relaxed text-slate-600 mb-8">
              Decisions get lost in Slack, old PRs, and forgotten Confluence pages. DevHub treats architectural decisions (ADRs) as active constraints, verifying that new code respects old rules.
            </p>
            <div className="flex flex-col gap-4">
              <Feature text="Automated ADR verification on every PR" />
              <Feature text="Living architecture maps that update themselves" />
              <Feature text="Traceability from code to documentation" />
            </div>
          </div>

          {/* Right: Visualization */}
          <div className="relative">
            <div className="absolute inset-0 bg-slate-100 rounded-3xl transform rotate-3 scale-105 opacity-50"></div>
            <div className="relative bg-white border border-slate-200 shadow-sm rounded-2xl p-8 lg:p-12 font-mono text-[13px]">
              
              {/* Main Node */}
              <div className="flex items-start gap-4 mb-6">
                 <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                 </div>
                 <div>
                   <span className="font-bold text-slate-900 block mb-1">ADR-012</span>
                   <span className="text-slate-500">Payment retry policy</span>
                 </div>
              </div>

              {/* Tree structure */}
              <div className="ml-4 pl-4 border-l-2 border-slate-200 flex flex-col gap-6 relative">
                 {/* Tree Item 1 */}
                 <div className="relative">
                   <div className="absolute -left-4 top-1/2 w-4 h-[2px] bg-slate-200"></div>
                   <div className="ml-4 flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-default">
                      <GitPullRequest className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">PR #238</span>
                      <span className="ml-auto text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">Compliant</span>
                   </div>
                 </div>

                 {/* Tree Item 2 */}
                 <div className="relative">
                   <div className="absolute -left-4 top-1/2 w-4 h-[2px] bg-slate-200"></div>
                   <div className="ml-4 flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-default">
                      <FileCode2 className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">PaymentService.ts</span>
                   </div>
                 </div>

                 {/* Tree Item 3 */}
                 <div className="relative">
                   <div className="absolute -left-4 top-1/2 w-4 h-[2px] bg-slate-200"></div>
                   <div className="ml-4 flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 cursor-default">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-900 font-medium">Technical Specification</span>
                      <span className="ml-auto text-[11px] text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">Update Needed</span>
                   </div>
                 </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
      </div>
      <span className="text-[14px] text-slate-700">{text}</span>
    </div>
  );
}
