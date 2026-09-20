"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";

export default function FinalCTA() {
  return (
    <section className="bg-white px-6 pb-24 pt-16 md:px-12 md:pb-32 md:pt-24">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div className="border-t border-slate-200 pt-16 md:pt-20">
            <div className="mx-auto max-w-[760px] text-center">
              {/* Eyebrow */}
              <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Start with your code
              </p>

              {/* Heading */}
              <h2 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-[52px] md:text-[60px]">
                Your repository is more
                <br className="hidden sm:block" />
                <span className="text-slate-400"> than just code.</span>
              </h2>

              {/* Description */}
              <p className="mx-auto mt-6 max-w-[560px] text-[16px] leading-7 text-slate-500 md:text-[17px]">
                Connect GitHub and bring your code, architecture, and
                engineering knowledge into one place.
              </p>

              {/* Actions */}
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/sign-in"
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-[14px] font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Connect GitHub
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/#context"
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-[14px] font-medium text-slate-600 transition-colors hover:text-slate-950"
                >
                  Explore DevHub
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Bottom closing line */}
            <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
              <p className="text-[12px] text-slate-400">
                Understand your software. Ship with confidence.
              </p>

              <p className="text-[12px] text-slate-400">
                Built for modern engineering teams.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
