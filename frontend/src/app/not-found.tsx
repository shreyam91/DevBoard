"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Search, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { Background } from "@/components/landing/Background";
import MarketingNavbar from "@/components/MarketingNavbar";

export default function NotFound() {
  const [terminalLines, setTerminalLines] = useState<number>(0);

  useEffect(() => {
    const sequence = [1, 2, 3, 4, 5];
    let cancelled = false;

    const runSequence = async () => {
      for (const step of sequence) {
        if (cancelled) break;
        await new Promise(r => setTimeout(r, 800));
        if (!cancelled) setTerminalLines(step);
      }
    };

    runSequence();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex min-h-screen flex-col selection:bg-accent-blue/20 text-slate-900 relative overflow-hidden">
      <Background />
      <MarketingNavbar isSignedIn={false} />
      
      <main className="relative z-10 flex-1 px-6 py-10 md:px-8 max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
        
        {/* Left Side: Typography & Actions */}
        <div className="flex flex-col items-start text-left">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 mb-6 shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest">Navigation Error</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[40px] md:text-[56px] font-bold tracking-tight mb-6 text-slate-900 leading-[1.1]"
          >
            Looks like this route was <br className="hidden md:block"/>
            <span className="text-accent-red">never merged.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[16px] md:text-[18px] text-slate-600 leading-[1.7] mb-4"
          >
            Our architecture scanner searched every branch, commit, and decision history, but this page doesn&apos;t exist.
            <br className="hidden md:block"/>
            {/* <br className="hidden md:block"/> */}
            <p className="text-blue-700">It may have been moved, renamed, or never committed.</p>
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 mb-6"
          >
            <Link 
              href="/dashboard" 
              className="flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3.5 text-[15px] font-medium text-white transition-transform hover:scale-[1.02] shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <Link 
              href="/" 
              className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-[15px] font-medium text-slate-700 transition-transform hover:scale-[1.02] shadow-sm hover:bg-slate-50"
            >
              Go Home
            </Link>
            {/* <button className="flex items-center gap-2 text-[14px] font-semibold text-slate-500 hover:text-slate-900 ml-2">
              <Search className="w-4 h-4" />
              Search Repository
            </button> */}
          </motion.div>

          {/* Fake Terminal */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-mono font-medium text-slate-400">devboard-scanner.sh</span>
            </div>
            <div className="p-4 font-mono text-[13px] text-slate-600 leading-relaxed min-h-[140px] flex flex-col gap-1">
              {terminalLines >= 1 && <div><span className="text-accent-blue">{'>'}</span> locating route...</div>}
              {terminalLines >= 2 && <div><span className="text-accent-blue">{'>'}</span> scanning architecture...</div>}
              {terminalLines >= 3 && <div><span className="text-accent-blue">{'>'}</span> checking Git history...</div>}
              {terminalLines >= 4 && <div className="text-accent-red"><span className="text-accent-red">{'>'}</span> route not found.</div>}
              {terminalLines >= 5 && <div><span className="text-accent-blue">{'>'}</span> returning control. <span className="animate-pulse">_</span></div>}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Interactive SVG Illustration */}
        <div className="relative h-[600px] w-full flex items-center justify-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 600">
            {/* Main Git Flow Branch */}
            <motion.path 
              d="M 50,300 C 150,300 200,300 300,300" 
              fill="none" stroke="#cbd5e1" strokeWidth="4"
              strokeDasharray="300"
              initial={{ strokeDashoffset: 300 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Diverging Broken Branch */}
            <motion.path 
              d="M 200,300 C 250,300 250,150 350,150" 
              fill="none" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 1 }}
            />
            
            {/* Main Nodes */}
            <motion.circle cx="50" cy="300" r="10" fill="white" stroke="#94a3b8" strokeWidth="3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
            <motion.circle cx="200" cy="300" r="10" fill="white" stroke="#94a3b8" strokeWidth="3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />
            <motion.circle cx="300" cy="300" r="10" fill="white" stroke="#94a3b8" strokeWidth="3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} />

            {/* Broken Node */}
            <motion.g 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: "spring", delay: 1.8 }}
            >
              <circle cx="350" cy="150" r="14" fill="#fef2f2" stroke="#dc2626" strokeWidth="3" />
              <path d="M 345,145 L 355,155 M 355,145 L 345,155" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
            </motion.g>

            {/* Broken Node Label */}
            <motion.g 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
            >
              <rect x="300" y="100" width="100" height="24" rx="4" fill="#dc2626" />
              <text x="350" y="116" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">Route Missing</text>
            </motion.g>

            {/* Doodles (Annotations) */}
            <motion.text x="220" y="240" fill="#64748b" fontSize="18" fontFamily="'Indie Flower', cursive" fontWeight="bold" transform="rotate(-10 220 240)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>Broken Route</motion.text>
            <motion.text x="120" y="130" fill="#ef4444" fontSize="48" fontFamily="'Indie Flower', " fontWeight="bold" transform="rotate(5 120 130)" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2 }}>404</motion.text>
            <motion.text x="450" y="220" fill="#64748b" fontSize="16" fontFamily="'Indie Flower', cursive" fontWeight="bold" transform="rotate(8 450 220)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.7 }}>Missing Node</motion.text>
            
            {/* Arrow pointing to broken node */}
            <motion.path 
              d="M 450,190 Q 400,160 380,155" 
              fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 2.8 }}
            />
            <motion.path 
              d="M 390,145 L 380,155 L 390,165" 
              fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
            />

            {/* Floating Architecture Boxes */}
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
              <rect x="420" y="320" width="80" height="50" rx="8" fill="white" stroke="#94a3b8" strokeWidth="2" />
              <text x="460" y="350" fill="#475569" fontSize="14" fontFamily="monospace" textAnchor="middle">Auth</text>
              <path d="M 300,300 C 350,300 350,345 420,345" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4,4" />
            </motion.g>

            <motion.g initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }}>
              {/* Database sketch */}
              <ellipse cx="480" cy="80" rx="30" ry="10" fill="none" stroke="#94a3b8" strokeWidth="2" />
              <path d="M 450,80 L 450,130 A 30 10 0 0 0 510,130 L 510,80" fill="none" stroke="#94a3b8" strokeWidth="2" />
              <text x="480" y="115" fill="#475569" fontSize="12" fontFamily="monospace" textAnchor="middle">DB</text>
            </motion.g>

            {/* AI Robot Scanner */}
            <motion.g 
              initial={{ x: 0, y: 240, opacity: 0 }}
              animate={{ x: 230, y: 180, opacity: 1 }}
              transition={{ duration: 2, delay: 2.5, ease: "easeInOut" }}
            >
              <rect x="-20" y="-20" width="40" height="30" rx="6" fill="white" stroke="#334155" strokeWidth="2" />
              <circle cx="-5" cy="-5" r="4" fill="#3b82f6" />
              <circle cx="10" cy="-5" r="4" fill="#3b82f6" />
              <path d="M -5,10 C 0,15 10,15 15,10" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
              <rect x="-10" y="-30" width="4" height="10" fill="#334155" />
              <circle cx="-8" cy="-32" r="3" fill="#ef4444" className="animate-pulse" />
              
              {/* Magnifying Glass */}
              {/* <motion.g
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <circle cx="-30" cy="-30" r="15" fill="none" stroke="#2563eb" strokeWidth="3" />
                <path d="M -20,-20 L 0,0" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                <text x="-45" y="-55" fill="#2563eb" fontSize="12" fontFamily="'Indie Flower', cursive" fontWeight="bold">Searching...</text>
              </motion.g> */}
            </motion.g>

            {/* Floating Commit Dots */}
            <motion.circle 
              cx="50" cy="300" r="4" fill="#3b82f6"
              animate={{ 
                cx: [50, 200, 250, 350], 
                cy: [300, 300, 150, 150],
                opacity: [1, 1, 1, 0]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 2 }}
            />
          </svg>
        </div>

      </main>
    </div>
  );
}
