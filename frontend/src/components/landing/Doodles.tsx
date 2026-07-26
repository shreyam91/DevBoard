"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

// Utility for rough stroke rendering
const roughPathTransition = { duration: 0.8, ease: "easeOut" as const };

export function HandDrawnArrow({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={cn("text-slate-400", className)}
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ ...roughPathTransition, delay }}
    >
      {/* Excalidraw-like rough arrow */}
      <path d="M10,90 Q40,15 90,50" strokeWidth="2.5" />
      <path d="M12,92 Q42,17 88,48" strokeWidth="1" opacity="0.5" />
      <path d="M70,40 L90,50 L75,70" strokeWidth="2.5" />
    </motion.svg>
  );
}

export function HandDrawnCircle({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={cn("text-accent-red", className)}
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ ...roughPathTransition, delay }}
    >
      <path d="M 50,5 C 80,5 95,30 95,50 C 95,80 70,95 50,95 C 20,95 5,70 5,50 C 5,20 30,5 50,5" strokeWidth="2.5" />
      <path d="M 48,7 C 78,7 93,32 93,52 C 93,82 68,97 48,97 C 18,97 3,72 3,52 C 3,22 28,7 48,7" strokeWidth="1" opacity="0.5" />
    </motion.svg>
  );
}

export function Annotation({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <motion.div 
      className={cn("font-['Indie_Flower',_cursive] text-[16px] font-semibold text-slate-500 rotate-[-4deg]", className)}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      {text}
    </motion.div>
  );
}
