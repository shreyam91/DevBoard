"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
// import { cn } from "@/utils/cn";

const features = [
  "Automatically discovers decisions",
  "Maintains architecture",
  "Detects conflicts in PRs",
  "Generates markdown docs"
];

export function Comparison() {
  return (
    <section className="px-6 py- md:px-12 max-w-[900px] mx-auto border-b border-slate-200">
      <div className="mb-10 flex flex-col items-start md:items-center md:text-center">
        <h2 className="text-[32px] md:text-[40px] font-semibold text-slate-900 mb-6 tracking-tight">The difference is automation.</h2>
        <p className="text-[16px] md:text-[18px] text-slate-600 max-w-2xl">
          Other tools require manual data entry. We believe the best documentation is the documentation that writes itself.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        
        {/* Legacy Tools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 border-l-2 border-slate-200 pl-6"
          >
            <div className="text-[16px] font-semibold text-slate-900">GitHub</div>
            <div className="text-[14px] text-slate-600 flex flex-col gap-2">
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-slate-400" /> Stores code</span>
              <span className="flex items-center gap-2"><X className="w-4 h-4 text-slate-400" /> Loses reasoning</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4 border-l-2 border-slate-200 pl-6"
          >
            <div className="text-[16px] font-semibold text-slate-900">Notion / Wiki</div>
            <div className="text-[14px] text-slate-600 flex flex-col gap-2">
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-slate-400" /> Stores docs</span>
              <span className="flex items-center gap-2"><X className="w-4 h-4 text-slate-400" /> Manual updates</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4 border-l-2 border-slate-200 pl-6"
          >
            <div className="text-[16px] font-semibold text-slate-900">ADR CLIs</div>
            <div className="text-[14px] text-slate-600 flex flex-col gap-2">
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-slate-400" /> Markdown files</span>
              <span className="flex items-center gap-2"><X className="w-4 h-4 text-slate-400" /> Manual writing</span>
            </div>
          </motion.div>
        </div>

        {/* DevBoard */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-8 rounded-2xl border-2 border-slate-900 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        >
          <div className="text-[20px] font-bold text-slate-900 mb-4">DevBoard</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-3 text-[14px] font-medium text-slate-700"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-slate-900" />
                </div>
                {feature}
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
