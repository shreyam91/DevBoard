"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, GitMerge } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative px-6 py-10 md:px-12 max-w-[1000px] mx-auto text-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 mb-8">
          <GitMerge className="w-6 h-6 text-slate-900" />
        </div>
        
        <h2 className="text-[40px] md:text-[56px] font-bold text-slate-900 mb-6 tracking-tight leading-[1.1]">
          Stop repeating yourself in PRs.
        </h2>
        
        <p className="text-[16px] md:text-[18px] font-medium text-slate-500 max-w-xl mx-auto mb-10">
          Connect your repository today and let DevBoard auto-document your architecture.
        </p>

        <div className="flex justify-center relative">
          <Link href="/sign-in" className="group flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-black text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md">
            <span className="text-[15px]">Connect GitHub</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
