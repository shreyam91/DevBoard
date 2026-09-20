"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitPullRequest,
  FileText,
  GitCommit,
  CheckCircle,
  AlertTriangle,
  FileCode2,
  Box,
  Layers,
  Search,
  ArrowRight,
  GitMerge,
  Clock,
  Activity,
  ShieldAlert,
  Terminal,
  Database,
  BookOpen
} from "lucide-react";

type TabState = "review" | "understand" | "architecture" | "documentation";

export default function InteractiveHero() {
  const [activeTab, setActiveTab] = useState<TabState>("review");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Sync activeTab with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["review", "understand", "architecture", "documentation"].includes(hash)) {
        setActiveTab(hash as TabState);
        // Optional: smoothly scroll to the product section if it's out of view
        const el = document.getElementById("product");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    // Check initial hash on mount
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabClick = (tab: TabState) => {
    setActiveTab(tab);
    window.history.pushState(null, "", `#${tab}`);
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#FAFAFA] pt-24 pb-32">
      {/* Background canvas (very subtle grid) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          opacity: 0.3
        }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Editorial Hero Text */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
            <span className="text-[11px] font-mono font-medium tracking-wider text-slate-500 uppercase">
              Engineering Intelligence for GitHub
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Understand what changed.<br />
            <span className="text-slate-400">Understand why it changed.</span>
          </h1>
          
          <p className="text-[17px] leading-relaxed text-slate-600 max-w-xl mb-10">
            DevHub connects pull requests, issues, code, architecture, decisions and documentation so engineering context doesn't disappear as your project evolves.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="/overview" className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-3 text-[14px] font-medium text-white hover:bg-slate-800 transition-colors">
              Connect GitHub &rarr;
            </a>
            <a href="#product" className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2">
              Explore the product <ArrowRight className="w-4 h-4 rotate-90" />
            </a>
          </div>
        </div>

        {/* Interactive Product Visualization */}
        <div id="product" className="relative mt-20 border border-slate-200 rounded-xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/50 px-4 overflow-x-auto hide-scrollbar">
            <TabButton 
              id="review" 
              label="01 Review" 
              active={activeTab === "review"} 
              onClick={() => handleTabClick("review")} 
            />
            <TabButton 
              id="understand" 
              label="02 Understand" 
              active={activeTab === "understand"} 
              onClick={() => handleTabClick("understand")} 
            />
            <TabButton 
              id="architecture" 
              label="03 Architecture" 
              active={activeTab === "architecture"} 
              onClick={() => handleTabClick("architecture")} 
            />
            <TabButton 
              id="documentation" 
              label="04 Documentation" 
              active={activeTab === "documentation"} 
              onClick={() => handleTabClick("documentation")} 
            />
          </div>

          {/* Interactive Playground Area */}
          <div className="relative min-h-[640px] w-full bg-[#FCFCFC] overflow-hidden p-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeTab === "review" && <ReviewState key="review" hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} />}
              {activeTab === "understand" && <UnderstandState key="understand" hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} />}
              {activeTab === "architecture" && <ArchitectureState key="arch" />}
              {activeTab === "documentation" && <DocumentationState key="doc" />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------
// Tab Components & UI Helpers
// ---------------------------------------------------------

function TabButton({ id, label, active, onClick }: { id: string, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`relative px-6 py-4 text-[13px] font-medium whitespace-nowrap transition-colors ${
        active ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
      {active && (
        <motion.div 
          layoutId="activeTabIndicator"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900"
        />
      )}
    </button>
  );
}

// ---------------------------------------------------------
// States
// ---------------------------------------------------------

function ReviewState({ hoveredNode, setHoveredNode }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex w-full h-full max-w-6xl gap-6 items-stretch"
    >
      {/* Left: PR Context & Meta */}
      <div className="w-[30%] flex flex-col gap-4">
        {/* Linked Issue */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="border border-slate-200 bg-white rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Box className="w-4 h-4" />
              <span className="text-[12px] font-mono">ISSUE #1046</span>
            </div>
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">In Progress</span>
          </div>
          <h3 className="text-[14px] font-medium text-slate-900 mb-3">Payment provider timeout</h3>
          <div className="flex flex-col gap-1.5 text-[12px] font-mono text-slate-500">
            <span className="flex items-center gap-2"><Clock className="w-3 h-3"/> Opened 1 day ago</span>
            <span className="flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-red-500"/> Priority: High</span>
            <div className="flex gap-1 mt-1">
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">payments</span>
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">reliability</span>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center -my-2 z-10 relative">
          <AnimatedConnector vertical height={16} delay={0.2} />
        </div>

        {/* PR Header / Metadata Strip */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="border border-slate-900 bg-slate-900 text-white rounded-lg p-5 shadow-md relative"
        >
          <div className="flex items-center gap-2 mb-2 text-slate-300">
            <GitPullRequest className="w-4 h-4 text-emerald-400" />
            <span className="text-[12px] font-mono">PR #238</span>
            <span className="text-[12px] text-slate-400 mx-1">·</span>
            <span className="text-[12px] font-medium">shreyam91</span>
          </div>
          <h3 className="text-[16px] font-medium mb-2 leading-tight">Fix payment timeout handling</h3>
          <div className="flex items-center gap-2 text-[12px] font-mono text-slate-400 mb-4 pb-4 border-b border-slate-700/50">
            <GitBranchIcon className="w-3 h-3" />
            <span>feature/payment-timeout <ArrowRight className="inline w-3 h-3 mx-1"/> main</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-mono text-slate-300">
            <span>7 files</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400">+184</span><span className="text-red-400 -ml-2">-76</span>
            <span className="text-slate-500">·</span>
            <span>3 commits</span>
            <span className="text-slate-500">·</span>
            <span>2 services</span>
            <span className="text-slate-500">·</span>
            <span>1 ADR</span>
          </div>
        </motion.div>

        {/* Review Health Data */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="border border-slate-200 bg-white rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Review</span>
             <div className="flex items-center gap-1.5">
               <span className="text-[18px] font-medium text-slate-900">82</span>
               <span className="text-[12px] text-slate-400 font-mono">/ 100</span>
             </div>
          </div>
          
          {/* Findings Distribution */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors" onMouseEnter={() => setHoveredNode('high')}>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[12px] font-mono text-slate-600">1 High</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-[12px] font-mono text-slate-600">2 Med</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[12px] font-mono text-slate-600">1 Low</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[12px] border-t border-slate-100 pt-3">
             <div className="flex flex-col"><span className="text-slate-400 font-mono">Confidence</span><span className="font-medium text-slate-900">94%</span></div>
             <div className="flex flex-col"><span className="text-slate-400 font-mono">Review time</span><span className="font-medium text-slate-900">32s</span></div>
             <div className="flex flex-col"><span className="text-slate-400 font-mono">Tests</span><span className="font-medium text-amber-600">2 affected</span></div>
             <div className="flex flex-col"><span className="text-slate-400 font-mono">Architecture</span><span className="font-medium text-red-600">1 conflict</span></div>
          </div>
        </motion.div>
      </div>

      {/* Right: Code Diff & Specific Finding */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Finding Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1, borderColor: hoveredNode === 'high' ? '#f87171' : '#e2e8f0' }}
          transition={{ duration: 0.3 }}
          className="border bg-white rounded-lg p-5 shadow-sm relative group transition-colors"
        >
          <div className="flex items-center gap-2 mb-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[12px] font-bold tracking-wider uppercase">High Priority</span>
          </div>
          <h4 className="text-[14px] font-medium text-slate-900 mb-2">Potential duplicate payment</h4>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            The retry path may execute the payment request again after the provider has already processed the original request. A transaction lock or idempotency key is required.
          </p>
        </motion.div>

        {/* Diff */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 border border-slate-200 bg-white rounded-lg flex flex-col overflow-hidden shadow-sm"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50/50">
            <FileCode2 className="w-4 h-4 text-slate-400" />
            <span className="text-[13px] font-mono text-slate-600">src/payment/PaymentService.ts</span>
            <span className="ml-auto text-[12px] text-slate-400 font-mono">Lines 85-92</span>
          </div>
          <div className="p-4 bg-white text-[13px] font-mono text-slate-800 flex-1 overflow-y-auto">
            <div className="flex gap-4 opacity-50 py-1">
              <span className="w-6 text-right select-none">85</span>
              <span className="text-slate-500">  try {"{"}</span>
            </div>
            <div className="flex gap-4 opacity-50 py-1">
              <span className="w-6 text-right select-none">86</span>
              <span className="text-slate-500">    const payment = await provider.init(req.amount);</span>
            </div>
            <motion.div className="flex gap-4 bg-red-50/50 text-red-700 py-1 -mx-4 px-4 border-l-2 border-red-400">
              <span className="w-6 text-right select-none opacity-50">87</span>
              <span>-   await payment.charge();</span>
            </motion.div>
            <motion.div 
              className={`flex gap-4 bg-green-50/50 text-green-700 py-1 -mx-4 px-4 border-l-2 border-green-400 relative transition-colors ${hoveredNode === 'high' ? 'bg-green-100/80' : ''}`}
            >
              <span className="w-6 text-right select-none opacity-50">87</span>
              <span>+   await retry(payment.charge(), {"{ "}max: 3{" }"});</span>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-red-100 text-red-800 px-2 py-0.5 rounded text-[11px] font-sans font-medium shadow-sm border border-red-200"
              >
                <AlertTriangle className="w-3 h-3" /> No idempotency key passed
              </motion.div>
            </motion.div>
            <div className="flex gap-4 opacity-50 py-1 mt-1">
              <span className="w-6 text-right select-none">88</span>
              <span className="text-slate-500">  {"}"} catch (e) {"{"}</span>
            </div>
            <div className="flex gap-4 opacity-50 py-1">
              <span className="w-6 text-right select-none">89</span>
              <span className="text-slate-500">    logger.error("Payment failed", e);</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function UnderstandState({ hoveredNode, setHoveredNode }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full h-full max-w-5xl flex gap-12 relative"
    >
      {/* Left: Impact Map */}
      <div className="flex-1 flex flex-col items-center py-4 relative z-10">
        
        {/* Flow: Issue -> PR */}
        <NodeCard type="issue" id="#1046" title="Payment provider timeout" delay={0.1} />
        <AnimatedConnector delay={0.2} />
        <NodeCard type="pr" id="#238" title="Fix payment timeout handling" highlighted delay={0.3} onHover={() => setHoveredNode('pr')} onLeave={() => setHoveredNode(null)} />
        <AnimatedConnector delay={0.4} />

        {/* Branch: Code Files */}
        <div className="flex justify-center gap-6 relative w-full mb-8">
           <AnimatedConnector horizontal delay={0.5} width={120} className="absolute top-0 left-1/2 -translate-x-full" />
           <AnimatedConnector horizontal delay={0.5} width={120} className="absolute top-0 right-1/2 translate-x-full" />
           <AnimatedConnector vertical delay={0.5} height={16} className="absolute top-0 left-1/2 -translate-x-full -ml-[120px]" />
           <AnimatedConnector vertical delay={0.5} height={16} className="absolute top-0 right-1/2 translate-x-full ml-[120px]" />
           <AnimatedConnector vertical delay={0.5} height={16} className="absolute top-0 left-1/2 -translate-x-1/2" />

           <div className="absolute top-4 left-1/2 -translate-x-full -ml-[200px]">
             <NodeCard type="code" id="PaymentService.ts" title="Retry logic" subtitle="+184 -76" delay={0.6} isHovered={hoveredNode === 'pr'} hoverAnnotation="Changed by commit 7f3a2d" />
           </div>
           <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[160px] flex justify-center">
             <NodeCard type="code" id="PaymentController.ts" title="Timeout config" subtitle="+12 -4" delay={0.7} isHovered={hoveredNode === 'pr'} hoverAnnotation="Changed by commit 91ab42" />
           </div>
           <div className="absolute top-6 right-1/3 translate-x-full ml-[200px]">
             <NodeCard type="code" id="Metrics.ts" title="Error tracking" subtitle="+8 -2" delay={0.8} hoverAnnotation="Changed by commit 3c91de" />
           </div>
        </div>

        <div className="h-20"></div>

        {/* Merge down to Architecture */}
        <div className="relative flex justify-center w-full mt-2">
           <AnimatedConnector vertical delay={0.9} height={24} />
        </div>
        <NodeCard type="arch" id="Architecture" title="Payment Gateway" delay={1.0} isHovered={hoveredNode === 'pr'} />
        <AnimatedConnector delay={1.1} />
        <NodeCard type="adr" id="ADR-012" title="Payment Retry Policy" delay={1.2} />
        <AnimatedConnector delay={1.3} />
        <NodeCard type="doc" id="Documentation" title="Technical Spec" delay={1.4} />

      </div>

      {/* Right: Insights Panels */}
      <div className="w-[30%] flex flex-col gap-6">
        
        {/* DevHub Understands Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="border border-slate-200 bg-white p-5 rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-slate-500" />
            <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">DevHub Understands</span>
          </div>

          <div className="mb-4">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">INTENT</span>
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
              Increase payment timeout and add safe retry handling for slow provider responses.
            </p>
          </div>

          <div className="mb-4">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">RISK</span>
            <p className="text-[13px] text-red-700 bg-red-50 border border-red-100 p-2 rounded leading-relaxed">
              Potential duplicate payment during retry.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12px] font-mono">
             <div className="border border-slate-100 bg-slate-50 rounded p-2 flex flex-col">
               <span className="text-slate-400">SCOPE</span>
               <span className="text-slate-900 font-medium">7 files, 2 svcs</span>
             </div>
             <div className="border border-slate-100 bg-slate-50 rounded p-2 flex flex-col">
               <span className="text-slate-400">CONFIDENCE</span>
               <span className="text-slate-900 font-medium">94%</span>
             </div>
          </div>
        </motion.div>

        {/* Commits List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="border border-slate-200 bg-white p-5 rounded-lg shadow-sm"
        >
          <span className="text-[11px] font-mono text-slate-400 block mb-3">COMMITS (3)</span>
          <div className="flex flex-col gap-3">
             <div className="flex flex-col gap-1 hover:bg-slate-50 p-1 -mx-1 rounded cursor-pointer transition-colors">
               <div className="flex items-center justify-between text-[13px]"><span className="text-slate-900 font-medium">Add retry handling</span><span className="font-mono text-slate-500">7f3a2d</span></div>
               <span className="text-[11px] text-slate-400">18m ago</span>
             </div>
             <div className="flex flex-col gap-1 hover:bg-slate-50 p-1 -mx-1 rounded cursor-pointer transition-colors">
               <div className="flex items-center justify-between text-[13px]"><span className="text-slate-900 font-medium">Increase provider timeout</span><span className="font-mono text-slate-500">91ab42</span></div>
               <span className="text-[11px] text-slate-400">42m ago</span>
             </div>
             <div className="flex flex-col gap-1 hover:bg-slate-50 p-1 -mx-1 rounded cursor-pointer transition-colors">
               <div className="flex items-center justify-between text-[13px]"><span className="text-slate-900 font-medium">Add payment metrics</span><span className="font-mono text-slate-500">3c91de</span></div>
               <span className="text-[11px] text-slate-400">1h ago</span>
             </div>
          </div>
        </motion.div>
        
      </div>
    </motion.div>
  );
}

function ArchitectureState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full max-w-5xl flex gap-12 relative items-stretch"
    >
      {/* Left: Arch Meta */}
      <div className="w-[30%] flex flex-col gap-4">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="border border-slate-200 bg-white p-5 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Architecture Health</span>
             <div className="flex items-center gap-1.5">
               <span className="text-[18px] font-medium text-slate-900">84</span>
               <span className="text-[12px] text-slate-400 font-mono">/ 100</span>
             </div>
          </div>
          <div className="flex flex-col gap-2 text-[13px]">
            <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500">Services affected</span><span className="font-mono text-slate-900">2</span></div>
            <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500">Components affected</span><span className="font-mono text-slate-900">3</span></div>
            <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500">Dependencies changed</span><span className="font-mono text-slate-900">2</span></div>
            <div className="flex justify-between pt-1"><span className="text-red-600 font-medium">ADR conflicts</span><span className="font-mono text-red-600 font-medium">1</span></div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border border-red-200 bg-red-50 p-5 rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3 text-red-700">
             <ShieldAlert className="w-4 h-4" />
             <span className="text-[12px] font-bold uppercase tracking-wider">Architecture Conflict</span>
          </div>
          <p className="text-[13px] text-red-900 mb-4 leading-relaxed font-medium">
            Direct database access introduced in controller layer, bypassing Service interface.
          </p>
          <div className="bg-white/60 p-3 rounded border border-red-100 text-[12px] mb-3">
            <span className="text-slate-500 block mb-1 font-mono">RELATED DECISION</span>
            <span className="text-slate-900 font-medium">ADR-012 — Payment Retry Policy</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-slate-500 font-mono">Confidence: 91%</span>
            <button className="text-[12px] font-medium text-red-700 hover:text-red-800 underline">View ADR</button>
          </div>
        </motion.div>
      </div>

      {/* Right: Architecture Diagram */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="flex-1 border border-slate-200 bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center relative"
      >
         <div className="flex flex-col items-center gap-8 relative w-full max-w-sm">
            {/* Node 1 */}
            <div className="w-full p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Box className="w-5 h-5 text-slate-400" />
                <span className="text-[14px] font-medium text-slate-900">API Gateway</span>
              </div>
              <span className="text-[12px] font-mono text-slate-400">12 routes</span>
            </div>
            
            <AnimatedConnector vertical delay={0.7} height={32} />

            {/* Node 2 (Conflict) */}
            <div className="w-full p-4 border-2 border-red-300 bg-white rounded-lg shadow-sm flex items-center justify-between relative group cursor-default">
              <div className="absolute -inset-2 border border-red-200 rounded-xl animate-pulse"></div>
              <div className="flex items-center gap-3 relative z-10">
                <Layers className="w-5 h-5 text-red-500" />
                <span className="text-[14px] font-medium text-slate-900">Payment Service</span>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[12px] font-mono text-red-600 font-medium">1 conflict</span>
              </div>
              {/* Annotation */}
              <div className="absolute top-1/2 -right-6 translate-x-full -translate-y-1/2 flex items-center gap-2">
                <div className="w-4 h-[1px] bg-slate-300"></div>
                <div className="bg-slate-900 text-white text-[11px] font-medium px-2 py-1 rounded whitespace-nowrap shadow-sm">
                  ADR-012 Violation
                </div>
              </div>
            </div>

            <AnimatedConnector vertical delay={0.9} height={32} />

            {/* Node 3 */}
            <div className="w-full p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-slate-400" />
                <span className="text-[14px] font-medium text-slate-900">Redis Cache</span>
              </div>
              <span className="text-[12px] font-mono text-slate-400">42 keys</span>
            </div>
         </div>
      </motion.div>
    </motion.div>
  );
}

function DocumentationState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full max-w-5xl flex gap-8 items-stretch"
    >
       {/* Left: Impact Map small & Doc List */}
       <div className="w-[45%] flex flex-col gap-6">
         {/* Small Impact Map */}
         <motion.div 
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
           className="border border-slate-200 bg-white p-4 rounded-lg shadow-sm flex flex-col gap-3"
         >
           <span className="text-[11px] font-mono text-slate-400">IMPACT PATH</span>
           <div className="flex items-center gap-4 text-[13px] font-medium text-slate-700">
             <div className="flex items-center gap-1.5"><GitPullRequest className="w-3.5 h-3.5"/> PR #238</div>
             <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
             <div className="flex items-center gap-1.5 text-amber-700"><BookOpen className="w-3.5 h-3.5"/> 2 updates required</div>
           </div>
         </motion.div>

         {/* List of Docs */}
         <div className="flex flex-col gap-2">
           <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Project Knowledge</h4>
           
           <DocRow name="Product Requirements" status="current" meta="✓ Current" delay={0.2} />
           <DocRow name="Software Req Spec (SRS)" status="current" meta="✓ Current" delay={0.3} />
           <DocRow name="Architecture Overview" status="warning" meta="⚠ Review" delay={0.4} />
           
           {/* Highlighted Row */}
           <motion.div 
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.5 }}
             className="flex items-center justify-between p-3 rounded-lg border-2 border-amber-200 bg-amber-50 cursor-pointer shadow-sm relative group"
           >
             <div className="flex items-center gap-3">
               <FileText className="w-4 h-4 text-amber-600" />
               <span className="text-[14px] font-medium text-amber-900">Technical Specification</span>
             </div>
             <span className="text-[12px] font-medium text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">⚠ Update</span>
             
             {/* Connector line drawing to the right panel on hover */}
             <div className="absolute top-1/2 right-0 translate-x-full w-8 h-[2px] bg-slate-300 hidden md:block">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-400 rotate-45 transform translate-x-1/2"></div>
             </div>
           </motion.div>

           <DocRow name="Implementation Plan" status="warning" meta="⚠ Update" delay={0.6} />
           <DocRow name="ADR-012: Payment Retry" status="current" meta="✓ Referenced" delay={0.7} />
         </div>
       </div>

       {/* Detail Panel */}
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
         className="flex-1 border border-slate-200 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 flex flex-col relative"
       >
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <FileText className="w-5 h-5 text-slate-700" />
            <h2 className="text-[18px] font-medium text-slate-900">Technical Specification</h2>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <span className="text-[11px] font-mono text-slate-400 mb-1 block">LAST UPDATED</span>
              <span className="text-[13px] font-medium text-slate-700">PR #221 (3 weeks ago)</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 mb-1 block">POTENTIALLY AFFECTED BY</span>
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-amber-700">
                <GitPullRequest className="w-3.5 h-3.5" /> PR #238
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <span className="text-[11px] font-mono text-slate-400 mb-2 block">REASON FOR UPDATE</span>
            <p className="text-[14px] text-slate-700 leading-relaxed p-4 bg-slate-50 border border-slate-200 rounded-lg italic">
              "Payment timeout constraint changed. Retry behavior contradicts Section 4.2 of the technical specification, which mandates a hard 10-second failure without client-side looping."
            </p>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <button className="bg-slate-900 text-white text-[13px] font-medium px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Generate Documentation Update
            </button>
          </div>
       </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------
// Helper Components
// ---------------------------------------------------------

function DocRow({ name, status, meta, delay = 0 }: { name: string, status: "current" | "warning", meta: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm transition-all cursor-default"
    >
      <div className="flex items-center gap-3">
        <FileText className="w-4 h-4 text-slate-400" />
        <span className="text-[14px] font-medium text-slate-700">{name}</span>
      </div>
      <span className={`text-[12px] font-medium ${status === 'current' ? 'text-slate-500' : 'text-amber-600'}`}>
        {meta}
      </span>
    </motion.div>
  );
}

function NodeCard({ type, id, title, subtitle, highlighted, delay = 0, isHovered = false, onHover, onLeave, hoverAnnotation }: any) {
  const icons = {
    issue: <Box className={`w-4 h-4 ${highlighted || isHovered ? "text-slate-900" : "text-slate-500"}`} />,
    pr: <GitPullRequest className={`w-4 h-4 ${highlighted || isHovered ? "text-slate-900" : "text-slate-500"}`} />,
    code: <FileCode2 className={`w-4 h-4 ${highlighted || isHovered ? "text-slate-900" : "text-slate-500"}`} />,
    adr: <FileText className={`w-4 h-4 ${highlighted || isHovered ? "text-slate-900" : "text-slate-500"}`} />,
    arch: <Layers className={`w-4 h-4 ${highlighted || isHovered ? "text-slate-900" : "text-slate-500"}`} />,
    doc: <BookOpen className={`w-4 h-4 ${highlighted || isHovered ? "text-slate-900" : "text-slate-500"}`} />
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: isHovered ? 1.02 : 1 }}
      transition={{ delay: isHovered ? 0 : delay, type: "spring", stiffness: 200, damping: 20 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`
        relative group transition-colors duration-300
        w-[220px] p-3 rounded-lg border bg-white flex flex-col gap-1.5 z-20
        ${highlighted || isHovered ? 'border-slate-400 shadow-[0_4px_20px_rgb(0,0,0,0.08)] ring-1 ring-slate-900/5' : 'border-slate-200 shadow-sm hover:border-slate-300'}
      `}
    >
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-1.5">
            {icons[type as keyof typeof icons]}
            <span className={`text-[12px] font-mono font-medium ${highlighted || isHovered ? 'text-slate-900' : 'text-slate-500'}`}>{id}</span>
         </div>
         {subtitle && <span className="text-[11px] text-slate-400 font-mono">{subtitle}</span>}
      </div>
      <span className={`text-[13px] leading-tight ${highlighted || isHovered ? 'font-medium text-slate-900' : 'text-slate-700'}`}>
        {title}
      </span>
      
      {/* Floating Hover Annotation */}
      {hoverAnnotation && (
        <div className={`absolute -right-3 top-1/2 -translate-y-1/2 translate-x-full transition-opacity pointer-events-none md:flex items-center gap-2 z-50 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-3 h-[1px] bg-slate-300"></div>
          <div className="bg-slate-900 text-white text-[11px] font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap">
            {hoverAnnotation}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function AnimatedConnector({ 
  horizontal = false, 
  vertical = true, 
  className = "", 
  delay = 0,
  width = 2,
  height = 32
}: { 
  horizontal?: boolean, 
  vertical?: boolean, 
  className?: string, 
  delay?: number,
  width?: number,
  height?: number
}) {
  if (horizontal) {
    return (
      <div className={`relative flex items-center ${className}`} style={{ width: `${width}px`, height: '2px' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay, duration: 0.5, ease: "easeInOut" }}
          className="h-[2px] bg-slate-300"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
          className="absolute right-0 w-2 h-2 border-t-2 border-r-2 border-slate-400 rotate-45 transform translate-x-1/2"
        />
      </div>
    );
  }

  if (vertical && !horizontal) {
    return (
      <div className={`relative flex flex-col items-center ${className}`} style={{ height: `${height}px`, width: '2px' }}>
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ delay, duration: 0.5, ease: "easeInOut" }}
          className="w-[2px] bg-slate-300"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
          className="absolute bottom-0 w-2 h-2 border-b-2 border-r-2 border-slate-400 rotate-45 transform translate-y-1/2"
        />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative ${className}`} 
    />
  );
}
// ---------------------------------------------------------
// Added git branch icon for PR strip
// ---------------------------------------------------------
function GitBranchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" x2="6" y1="3" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}
