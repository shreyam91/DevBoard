"use client";

import { motion } from "framer-motion";

export function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-50">
      {/* Subtle Graph Paper / Blueprint Grid */}
      <div 
        className="absolute inset-0 opacity-[0.6]"
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #cbd5e1 1px, transparent 1px),
            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Fainter Sub-grid for realism */}
      <div 
        className="absolute inset-0 opacity-[0.3]"
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: '10px 10px',
        }}
      />

      {/* Gentle radial gradient to soften the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(248,250,252,1)_100%)]" />

      {/* Project-Specific Background Doodles */}
      <svg className="absolute w-full h-full inset-0 opacity-[0.2] text-slate-400" viewBox="0 0 1200 1000" preserveAspectRatio="xMidYMid slice">
        
        {/* Top left: Code Brackets { } */}
        <motion.g 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.2 }}
        >
          <path d="M 120,150 Q 100,150 100,180 T 80,210 T 100,240 Q 120,240 120,270" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M 180,150 Q 200,150 200,180 T 220,210 T 200,240 Q 180,240 180,270" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <text x="125" y="215" fill="currentColor" fontSize="24" fontFamily="monospace" opacity="0.6">const doc</text>
        </motion.g>

        {/* Top right: Git Branch Flow */}
        <motion.g 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <path d="M 850,200 L 950,200" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
          <path d="M 880,200 C 880,150 920,150 920,200" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="850" cy="200" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="880" cy="200" r="8" fill="white" stroke="currentColor" strokeWidth="2" />
          <circle cx="920" cy="150" r="8" fill="white" stroke="currentColor" strokeWidth="2" />
          <circle cx="950" cy="200" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="930" y="140" fill="currentColor" fontSize="14" fontFamily="monospace" opacity="0.6">PR #42</text>
        </motion.g>

        {/* Bottom left: Database & Architecture Flow */}
        <motion.g 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 1.2 }}
        >
          {/* DB Cylinder */}
          <ellipse cx="200" cy="750" rx="40" ry="15" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 160,750 L 160,820 A 40 15 0 0 0 240,820 L 240,750" fill="none" stroke="currentColor" strokeWidth="2" />
          <ellipse cx="200" cy="785" rx="40" ry="15" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
          
          {/* API Box */}
          <rect x="80" y="770" width="40" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="85" y="795" fill="currentColor" fontSize="12" fontFamily="monospace">API</text>
          
          {/* Arrow */}
          <path d="M 120,790 L 150,790" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 140,785 L 150,790 L 140,795" fill="none" stroke="currentColor" strokeWidth="2" />
        </motion.g>

        {/* Middle right: File Sync icon */}
        <motion.g 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <path d="M 1000,550 L 1000,650 L 1080,650 L 1080,590 L 1040,550 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 1040,550 L 1040,590 L 1080,590" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="1010" y="610" fill="currentColor" fontSize="12" fontFamily="monospace" opacity="0.8">ARCH.md</text>
          
          {/* Refresh/Sync arrows around it */}
          <path d="M 970,600 A 30 30 0 0 1 1000,570" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
          <path d="M 995,565 L 1000,570 L 995,575" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </motion.g>

        {/* Middle left: Gear (Automation) */}
        <motion.g 
          initial={{ opacity: 0, rotate: -45 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1.5, delay: 1.8 }}
          style={{ transformOrigin: "50px 450px" }}
        >
          <circle cx="50" cy="450" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 50,425 L 50,435 M 50,465 L 50,475 M 25,450 L 35,450 M 65,450 L 75,450 M 32,432 L 39,439 M 61,461 L 68,468 M 32,468 L 39,461 M 61,439 L 68,432" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </motion.g>

        {/* Bottom right: Shield (Protection) */}
        <motion.g 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 2.1 }}
        >
          <path d="M 1100,800 L 1060,820 L 1060,860 C 1060,900 1100,920 1100,920 C 1100,920 1140,900 1140,860 L 1140,820 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 1090,860 L 1100,870 L 1115,845" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>

        {/* Top middle: Cloud Sync */}
        <motion.g 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 2.4 }}
        >
          <path d="M 600,120 A 20 20 0 0 0 570,140 A 15 15 0 0 0 570,170 L 630,170 A 15 15 0 0 0 630,140 A 25 25 0 0 0 600,120 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 600,140 L 600,155 M 590,145 L 600,155 L 610,145" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
      </svg>
    </div>
  );
}
