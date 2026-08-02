"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Database, Bot, FileCode2, GitMerge } from "lucide-react";
import { HandDrawnArrow } from "./Doodles";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 md:px-12 overflow-hidden border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16 items-center">
        
        {/* Left: Engineered Typography */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-start text-left"
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[12px] font-semibold tracking-wide text-slate-600 uppercase">The Memory Layer for Software Architecture</span>
          </div>

          <h1 className="text-[42px] md:text-[58px] lg:text-[66px] font-bold tracking-tight text-slate-900 leading-[1.05] mb-2">
            Every Architecture <br /> Decision. <br />
            <span className="text-slate-400">Remembered Forever.</span>
          </h1>

          <p className="max-w-lg text-[16px] md:text-[18px] leading-[1.6] text-slate-600 mb-4 font-medium">
            Every pull request changes your architecture. DevBoard automatically reconstructs, documents, and protects those decisions before technical debt takes over.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto relative">
            <Link href="/sign-in" className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-lg bg-black text-white font-medium hover:scale-[1.02] active:scale-[0.98] shadow-md transition-all">
              <span className="text-[14px]">Connect GitHub</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            
            <Link href="#preview" className="group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium shadow-sm transition-all">
              <Play className="w-4 h-4 text-slate-400" />
              <span className="text-[14px]">Watch Demo</span>
            </Link>
            <HandDrawnArrow className="absolute -bottom-12 right-0 w-12 h-12 hidden lg:block text-slate-400 rotate-[-15deg]" delay={0.5} />
          </div>
        </motion.div>

        {/* Right: Animated Node Graph */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-10 w-full h-[500px] hidden lg:flex items-center justify-center"
        >
          <div className="relative w-full h-full max-w-[500px]">
            {/* SVG Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <motion.path 
                d="M 50,100 C 150,100 150,250 250,250" 
                fill="none" 
                stroke="url(#lineGrad)" 
                strokeWidth="2"
                strokeDasharray="400"
                initial={{ strokeDashoffset: 400 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              />
              <motion.path 
                d="M 250,250 C 350,250 350,150 450,150" 
                fill="none" 
                stroke="url(#lineGrad)" 
                strokeWidth="2"
                strokeDasharray="400"
                initial={{ strokeDashoffset: 400 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
              />
              <motion.path 
                d="M 250,250 C 350,250 350,350 450,350" 
                fill="none" 
                stroke="#ea580c" 
                strokeWidth="2"
                strokeDasharray="400"
                initial={{ strokeDashoffset: 400 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
              />
            </svg>

            {/* Nodes */}
            {/* Node 1: Developer / GitHub Repo */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="absolute top-[80px] left-[10px] w-20 h-20 bg-white border-2 border-slate-200 rounded-xl shadow-lg flex flex-col items-center justify-center gap-1 z-10"
            >
              <GitMerge className="w-6 h-6 text-slate-700" />
              <span className="text-[10px] font-semibold text-slate-500">GitHub</span>
            </motion.div>

            {/* Node 2: Architecture Decisions */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 1 }}
              className="absolute top-[210px] left-[210px] w-20 h-20 bg-white border-2 border-accent-blue rounded-xl shadow-xl flex flex-col items-center justify-center gap-1 z-10"
            >
              <Database className="w-6 h-6 text-accent-blue" />
              <span className="text-[10px] font-semibold text-accent-blue text-center leading-tight">DevBoard<br/>Graph</span>
            </motion.div>

            {/* Node 3: AI Analysis */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 1.8 }}
              className="absolute top-[110px] left-[410px] w-20 h-20 bg-white border-2 border-slate-200 rounded-xl shadow-lg flex flex-col items-center justify-center gap-1 z-10"
            >
              <Bot className="w-6 h-6 text-slate-700" />
              <span className="text-[10px] font-semibold text-slate-500">AI Engine</span>
            </motion.div>

            {/* Node 4: ARCHITECTURE.md */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 2 }}
              className="absolute top-[310px] left-[410px] w-20 h-20 bg-white border-2 border-accent-orange rounded-xl shadow-lg flex flex-col items-center justify-center gap-1 z-10"
            >
              <FileCode2 className="w-6 h-6 text-accent-orange" />
              <span className="text-[10px] font-semibold text-accent-orange text-center leading-tight">Docs<br/>Sync</span>
            </motion.div>

            {/* Faint UI Mockup Background to give context */}
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-sm z-0 pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
