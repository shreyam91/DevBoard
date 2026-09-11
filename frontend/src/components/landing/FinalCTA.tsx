"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";

export default function FinalCTA() {
  return (
    <section className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div className="rounded-2xl border border-slate-200 bg-[#0f141c] p-10 text-white md:p-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-[34px] font-bold leading-[1.05] tracking-[-0.02em] md:text-[48px]">
                Bring your repository into context.
              </h2>
              <p className="mx-auto mt-5 max-w-[48ch] text-[17px] leading-relaxed text-slate-300">
                Connect a GitHub project and see your code, architecture, and engineering knowledge in one place.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/sign-in"
                  className="group inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-[15px] font-semibold text-slate-900 transition-transform hover:scale-[1.02]"
                >
                  Connect GitHub
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/#context"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/5"
                >
                  Explore DevHub
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}