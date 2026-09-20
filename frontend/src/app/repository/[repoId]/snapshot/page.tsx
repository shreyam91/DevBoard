'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch,
  Box,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface SnapshotData {
  repoInfo: {
    owner: string;
    name: string;
    visibility: string;
    defaultBranch: string;
    createdDate: string;
    lastUpdated: string;
    size: number;
    age: string;
    language: string;
  };
  stats: {
    commits: number;
    contributors: number;
    files: number;
    directories: number;
    packages: number;
    workflows: number;
  };
  techStack: string[];
  insights: string[];
  complexity: string;
  complexityExplanation: string;
  score: number;
  is_new_repo: boolean;
}

const TerminalLog = () => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const sequence = [
      'connecting to repository...',
      'authenticating read access...',
      'loading commit history...',
      'scanning project structure...',
      'building dependency tree...',
      'detecting core technologies...',
      'extracting architectural signals...',
      'estimating repository complexity...',
      'preparing architecture reconstruction...',
      'scan complete.'
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < sequence.length) {
        setLines(prev => [...prev, `> ${sequence[currentIndex]}`]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 850);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[13px] text-slate-300 h-48 overflow-y-auto flex flex-col justify-end shadow-inner relative">
      <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none" />
      <AnimatePresence initial={false}>
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-1"
          >
            {line}
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.div 
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="w-2 h-4 bg-slate-400 mt-1"
      />
    </div>
  );
};

const AnimatedCounter = ({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const step = Math.max(1, Math.ceil(value / 30));
      const interval = setInterval(() => {
        current += step;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(current);
        }
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-100">
      <span className="text-[24px] font-extrabold text-slate-900 tabular-nums">
        {displayValue.toLocaleString()}
      </span>
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1 text-center">
        {label}
      </span>
    </div>
  );
};

const ArchitectureRadar = ({ techs }: { techs: string[] }) => {
  return (
    <div className="relative w-full aspect-square flex items-center justify-center max-w-[400px] mx-auto overflow-hidden">
      {/* Concentric Circles */}
      {[1, 2, 3].map((circle) => (
        <motion.div
          key={circle}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: circle * 0.2 }}
          className="absolute rounded-full border border-accent-blue/20"
          style={{ width: `${circle * 30}%`, height: `${circle * 30}%` }}
        />
      ))}

      {/* Rotating sweep */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="absolute w-full h-full rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.1) 60deg, transparent 60deg)'
        }}
      />

      {/* Center Repo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
        className="relative z-10 w-16 h-16 bg-white border-4 border-accent-blue rounded-full shadow-lg flex items-center justify-center"
      >
        <Box className="w-6 h-6 text-accent-blue" />
      </motion.div>

      {/* Tech Nodes */}
      {techs.map((tech, i) => {
        const angle = (i / techs.length) * Math.PI * 2;
        const radius = 100 + (i % 2 === 0 ? 0 : 40); // Stagger radius
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={tech}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2 + (i * 0.3), type: "spring" }}
            className="absolute z-20 flex flex-col items-center gap-1"
            style={{ x, y }}
          >
            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
            <span className="text-[10px] font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm whitespace-nowrap">
              {tech}
            </span>
            {/* SVG Line to center */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '400px', height: '400px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', overflow: 'visible' }}>
              <motion.line 
                x1="200" y1="200" x2={200 + x} y2={200 + y} 
                stroke="rgba(59, 130, 246, 0.3)" 
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 2.2 + (i * 0.3), duration: 0.8 }}
              />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
};

export default function SnapshotPage({ params }: { params: { repoId: string } }) {
  const router = useRouter();
  const { repoId } = params;

  const [data, setData] = useState<SnapshotData | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Start minimum timer of 9 seconds
    const startTime = Date.now();
    const MIN_TIME = 9000;

    const fetchSnapshot = async () => {
      try {
        const res = await fetch(`/api/repos/${repoId}/snapshot`, { method: 'POST' });
        const snapshot = await res.json();
        
        if (isMounted && res.ok) {
          setData(snapshot);

          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, MIN_TIME - elapsed);

          setTimeout(() => {
            if (isMounted) {
              setIsFinishing(true);
              setTimeout(() => {
                if (snapshot.is_new_repo) {
                  router.push(`/repos/${repoId}/setup`);
                } else {
                  router.push(`/repos/${repoId}`);
                }
              }, 1500); // 1.5s for the final transition banner
            }
          }, remainingTime);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchSnapshot();

    return () => { isMounted = false; };
  }, [repoId, router]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col font-sans selection:bg-accent-blue/20">
      
      {/* Blueprint Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-8 relative z-10 flex flex-col">
        
        {/* Header */}
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[28px] font-extrabold text-slate-900 tracking-tight"
          >
            Repository Snapshot
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[15px] text-slate-500 font-medium"
          >
            Here's what we discovered before reconstructing your architecture.
          </motion.p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          
          {/* Left Panel */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {!data ? (
              <div className="h-[400px] bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col mb-6">
                  <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Repository</span>
                  <h2 className="text-[18px] font-bold text-slate-900 leading-tight break-all">
                    {data.repoInfo.owner}/{data.repoInfo.name}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-[13px] text-slate-500 font-medium">Visibility</span>
                    <span className="text-[13px] font-semibold text-slate-900">{data.repoInfo.visibility}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-[13px] text-slate-500 font-medium">Branch</span>
                    <span className="text-[13px] font-semibold text-slate-900 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                      {data.repoInfo.defaultBranch}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-[13px] text-slate-500 font-medium">Language</span>
                    <span className="text-[13px] font-semibold text-slate-900">{data.repoInfo.language}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-[13px] text-slate-500 font-medium">Size</span>
                    <span className="text-[13px] font-semibold text-slate-900">{(data.repoInfo.size / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-slate-500 font-medium">Complexity</span>
                    <span className="text-[13px] font-bold text-accent-blue bg-blue-50 px-2 py-0.5 rounded-md">
                      {data.complexity}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Score Ring */}
            {data && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-6"
              >
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                    <motion.circle 
                      initial={{ strokeDasharray: "0 1000" }}
                      animate={{ strokeDasharray: `${data.score * 1.75} 1000` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
                      cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
                      className="text-emerald-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[16px] font-extrabold text-slate-900">{data.score}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Architecture Score</h3>
                  <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">Sufficient data for reconstruction.</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Center Panel */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden flex-1 relative min-h-[400px] flex items-center justify-center">
              {!data ? (
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-accent-blue animate-spin" />
              ) : (
                <ArchitectureRadar techs={data.techStack} />
              )}
            </div>

            {/* Tech Badges */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center h-[100px]">
              <AnimatePresence>
                {data?.techStack.map((tech, i) => (
                  <motion.div
                    key={tech}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + (i * 0.1) }}
                    className="bg-slate-100 text-slate-700 text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-slate-200 h-fit"
                  >
                    {tech}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {!data ? (
              <div className="h-full bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <AnimatedCounter value={data.stats.commits} label="Commits" delay={500} />
                  <AnimatedCounter value={data.stats.contributors} label="Contribs" delay={700} />
                  <AnimatedCounter value={data.stats.files} label="Files" delay={900} />
                  <AnimatedCounter value={data.stats.directories} label="Dirs" delay={1100} />
                  <AnimatedCounter value={data.stats.packages} label="Pkgs" delay={1300} />
                  <AnimatedCounter value={data.stats.workflows} label="CI Jobs" delay={1500} />
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-[14px] font-bold text-slate-900">AI Insights</h3>
                  </div>
                  <div className="space-y-4">
                    {data.insights.map((insight, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2 + (i * 0.4) }}
                        className="flex gap-3"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-1.5 shrink-0" />
                        <p className="text-[13px] text-slate-600 leading-snug">{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

        {/* Live Terminal */}
        <div className="mt-8">
          <TerminalLog />
        </div>

      </div>

      {/* Finishing Overlay */}
      <AnimatePresence>
        {isFinishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-accent-blue flex flex-col items-center justify-center text-white"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <CheckCircle2 className="w-16 h-16 mb-6 text-white/90" />
              <h2 className="text-[32px] font-extrabold tracking-tight mb-2">Repository Scan Complete</h2>
              <p className="text-[16px] text-white/80 font-medium">
                {data?.is_new_repo ? 'Launching Project Setup...' : 'Launching Repository Archaeology...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
