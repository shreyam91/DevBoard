"use client";

import { motion } from "framer-motion";
import { GitCommit, Search, FileCode2, GitPullRequest } from "lucide-react";
import { Annotation } from "./Doodles";

export function SolutionFeatures() {
  return (
    <section className="relative py-12 overflow-hidden border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        {/* Layout 1: Git Node Tree (Repo Archaeology) */}
        <div className="grid md:grid-cols-[1fr_1fr] gap-16 mb-10 items-center">
          <div>
            <h3 className="text-[28px] font-semibold text-slate-900 mb-4 flex items-center gap-3">
              <Search className="w-6 h-6 text-accent-blue" />
              Repo Archaeology
            </h3>
            <p className="text-[16px] text-slate-600 leading-relaxed">
              Connect DevBoard to an existing repository, and our AI scans years of Git history to reconstruct all past architectural decisions automatically. No manual data entry required.
            </p>
          </div>
          <div className="relative h-[300px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-6 overflow-hidden">
             {/* Git Graph SVG */}
             <svg className="absolute w-full h-full inset-0 pointer-events-none" viewBox="0 0 400 300">
               <motion.path 
                 d="M 50,250 C 50,150 150,150 200,150 L 350,150" 
                 fill="none" stroke="#cbd5e1" strokeWidth="3"
                 strokeDasharray="400"
                 initial={{ strokeDashoffset: 400 }}
                 whileInView={{ strokeDashoffset: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
               />
               <motion.path 
                 d="M 100,250 C 100,200 150,200 200,150" 
                 fill="none" stroke="#2563eb" strokeWidth="3"
                 strokeDasharray="200"
                 initial={{ strokeDashoffset: 200 }}
                 whileInView={{ strokeDashoffset: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
               />
             </svg>
             
             <motion.div 
               initial={{ scale: 0, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               viewport={{ once: true }}
               transition={{ type: "spring", delay: 1 }}
               className="absolute left-[170px] top-[125px] flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm"
             >
               <GitCommit className="w-4 h-4 text-accent-blue" />
               <span className="text-[12px] font-medium text-slate-700">Decision Extracted</span>
             </motion.div>
          </div>
        </div>

        {/* Layout 2: Conflict Detection (PR Branching) */}
        <div className="grid md:grid-cols-[1fr_1fr] gap-16 items-center mb-10">
          <div className="order-2 md:order-1 relative h-[300px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-6 overflow-hidden">
            <svg className="absolute w-full h-full inset-0 pointer-events-none" viewBox="0 0 400 300">
              <motion.path 
                d="M 50,150 L 350,150" 
                fill="none" stroke="#cbd5e1" strokeWidth="3"
                strokeDasharray="300"
                initial={{ strokeDashoffset: 300 }}
                whileInView={{ strokeDashoffset: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "linear" }}
              />
              <motion.path 
                d="M 150,250 C 150,150 250,150 250,150" 
                fill="none" stroke="#dc2626" strokeWidth="3"
                strokeDasharray="200"
                initial={{ strokeDashoffset: 200 }}
                whileInView={{ strokeDashoffset: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5, ease: "linear" }}
              />
            </svg>

            <Annotation text="Blocked!" className="absolute right-12 top-24 hidden md:block" delay={1.5} />

            <motion.div 
               initial={{ scale: 0, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               viewport={{ once: true }}
               transition={{ type: "spring", delay: 1.2 }}
               className="absolute left-[200px] top-[120px] flex flex-col items-start gap-1 bg-white border border-accent-red px-4 py-3 rounded-lg shadow-lg"
             >
               <div className="flex items-center gap-2 text-accent-red font-semibold text-[13px]">
                 <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
                 Architecture Conflict
               </div>
               <span className="text-[11px] text-slate-500">PR violates decision #42</span>
             </motion.div>
          </div>
          
          <div className="order-1 md:order-2">
            <h3 className="text-[28px] font-semibold text-slate-900 mb-4 flex items-center gap-3">
              <GitPullRequest className="w-6 h-6 text-accent-red" />
              Conflict Detection
            </h3>
            <p className="text-[16px] text-slate-600 leading-relaxed">
              We monitor every new pull request. If an engineer's code contradicts a previous architectural decision, DevBoard flags it before it merges.
            </p>
          </div>
        </div>

        {/* Layout 3: Living Documentation (Notebook style) */}
        <div className="flex flex-col items-center mb-4 text-center relative max-w-4xl mx-auto">
          <h3 className="text-[28px] font-semibold text-slate-900 mb-4 flex items-center justify-center gap-3">
            <FileCode2 className="w-6 h-6 text-accent-green" />
            AI Generated ARCHITECTURE.md
          </h3>
          <p className="text-[16px] text-slate-600 leading-relaxed max-w-2xl mb-12">
            DevBoard generates and maintains a living architecture document, opening automated PRs to keep it perfectly in sync with your codebase.
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full text-left bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
          >
            <div className="h-10 border-b border-slate-100 flex items-center px-4 bg-slate-50">
              <span className="text-slate-400 text-[12px] font-mono font-medium">ARCHITECTURE.md</span>
            </div>
            <div className="p-8 font-mono text-[13px] text-slate-700 leading-loose">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <span className="text-accent-blue font-bold"># Architecture Decisions</span><br/><br/>
                <span className="font-bold text-slate-900">## 1. State Management</span><br/>
                We use Zustand for global state management due to its minimal boilerplate.<br/><br/>
                <span className="font-bold text-slate-900">## 2. API Layer</span><br/>
                tRPC is used for all internal API calls to ensure end-to-end type safety.<br/>
              </motion.div>
              <motion.div 
                className="inline-block w-2 h-4 bg-slate-400 animate-pulse align-middle ml-1" 
              />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
