"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Background } from "@/components/landing/Background";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { BrainCircuit, GitCommit, SearchCode, ServerCrash, ShieldCheck } from "lucide-react";
import { useRef } from "react";

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const timelineHeight = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);

  return (
    <div className="flex min-h-screen flex-col selection:bg-accent-blue/20 text-slate-900 relative overflow-hidden">
      <Background />
      <MarketingNavbar isSignedIn={false} />
      
      <main className="relative z-10 flex-1 px-6 md:px-12 max-w-[1000px] mx-auto w-full" ref={containerRef}>
        
        {/* Hero */}
        <div className="text-center mb-12 pt-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 mb-4 shadow-sm"
          >
            <BrainCircuit className="w-4 h-4 text-accent-blue" />
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest">About DevBoard</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[48px] md:text-[64px] font-bold tracking-tight mb-4 text-slate-900 leading-[1.1]"
          >
            Building the memory layer <br className="hidden md:block"/>
            for software architecture.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[18px] md:text-[22px] text-slate-500 max-w-[700px] mx-auto leading-relaxed"
          >
            We believe the best documentation is the documentation that writes itself.
          </motion.p>
        </div>

        {/* The Timeline Journey */}
        <div className="relative pl-8 md:pl-0 max-w-[800px] mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 md:-ml-[1px] top-0 bottom-0 w-[2px] bg-slate-100">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-accent-blue origin-top"
              style={{ height: timelineHeight }}
            />
          </div>

          <TimelineNode 
            icon={<ServerCrash className="w-5 h-5 text-accent-red" />}
            title="The Problem"
            description="Software architectures degrade over time. Decisions are lost in Slack threads, and documentation becomes obsolete the moment it is written."
            align="right"
          />

          <TimelineNode 
            icon={<GitCommit className="w-5 h-5 text-slate-600" />}
            title="Architecture Drift"
            description="Without enforcement, new engineers unknowingly reverse previous decisions, leading to a tangled codebase and weeks of lost onboarding time."
            align="left"
          />

          <TimelineNode 
            icon={<SearchCode className="w-5 h-5 text-accent-blue" />}
            title="Repository Archaeology"
            description="DevBoard automatically scans years of Git history to reconstruct all past architectural decisions without any manual data entry."
            align="right"
          />

          <TimelineNode 
            icon={<BrainCircuit className="w-5 h-5 text-accent-green" />}
            title="AI Analysis"
            description="Our custom models understand the semantic intent behind every code change, mapping commits to actual architectural concepts."
            align="left"
          />

          <TimelineNode 
            icon={<ShieldCheck className="w-5 h-5 text-accent-blue" />}
            title="Conflict Detection & Living Docs"
            description="We monitor pull requests to block architectural violations, and automatically generate living documentation that never goes out of sync."
            align="right"
          />
        </div>

        {/* Future Vision */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="border-t border-slate-200 pt-0 max-w-[800px] mx-auto text-center"
        >
          <h2 className="text-[32px] md:text-[40px] font-bold text-slate-900 mb-2 tracking-tight">Our Future Vision</h2>
          <p className="text-[18px] text-slate-600 leading-[1.8] mb-12">
            Every software team in the world wastes countless hours repeating the same architectural debates. Our vision is a future where knowledge is persistent, pull requests are automatically validated against design intent, and engineers can focus on building features rather than deciphering legacy code.
          </p>
        </motion.div>

      </main>
      
      <div className="relative z-10">
        <MarketingFooter />
      </div>
    </div>
  );
}

function TimelineNode({ icon, title, description, align }: { icon: React.ReactNode, title: string, description: string, align: 'left' | 'right' }) {
  const isRight = align === 'right';
  
  return (
    <div className={`relative flex flex-col md:flex-row items-start md:items-center justify-between w-full mb-20 ${isRight ? 'md:flex-row-reverse' : ''}`}>
      {/* Node Icon */}
      <div className="absolute left-[-16px] md:left-1/2 md:-ml-6 w-12 h-12 bg-white rounded-full border-4 border-slate-50 flex items-center justify-center z-10 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
        {icon}
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, x: isRight ? 20 : -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className={`w-full md:w-[45%] pl-12 md:pl-0 ${isRight ? 'md:text-left md:pl-16' : 'md:text-right md:pr-16'}`}
      >
        <h3 className="text-[20px] font-semibold text-slate-900 mb-3">{title}</h3>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          {description}
        </p>
      </motion.div>
      
      {/* Empty space for the other side */}
      <div className="hidden md:block md:w-[45%]" />
    </div>
  );
}
