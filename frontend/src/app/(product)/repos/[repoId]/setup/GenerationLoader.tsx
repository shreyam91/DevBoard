'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Bot, BrainCircuit, Blocks, FileCode, Check, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { checkInitializationStatus } from '@/app/actions/setup';

const STAGES = [
  { id: 1, label: 'Understanding project goals', icon: BrainCircuit },
  { id: 2, label: 'Designing architecture', icon: Blocks },
  { id: 3, label: 'Selecting technology recommendations', icon: Bot },
  { id: 4, label: 'Creating architectural decisions', icon: Check },
  { id: 5, label: 'Writing ARCHITECTURE.md', icon: FileCode },
  { id: 6, label: 'Preparing GitHub commit', icon: Send },
];

export default function GenerationLoader({ repoId }: { repoId: string }) {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  // Fake progressive loading for UI wow factor (since Server Action runs synchronously on server)
  // We advance through the stages over ~10-15 seconds.
  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      if (tick < 100) {
        setProgress(tick);
        
        // Update stage based on progress
        if (tick < 15) setCurrentStage(0);
        else if (tick < 30) setCurrentStage(1);
        else if (tick < 45) setCurrentStage(2);
        else if (tick < 65) setCurrentStage(3);
        else if (tick < 85) setCurrentStage(4);
        else setCurrentStage(5);
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Poll database to see if initialization_status changed to 'review' or 'completed'
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      try {
        const { initialization_status } = await checkInitializationStatus(repoId);
        if (initialization_status === 'review' || initialization_status === 'completed') {
          clearInterval(checkInterval);
          setProgress(100);
          setCurrentStage(6);
          // Wait a tiny bit for the animation to finish
          setTimeout(() => {
            router.refresh(); // This will flip SetupClient to ArchitectureReview
          }, 800);
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);
    return () => clearInterval(checkInterval);
  }, [repoId, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 min-h-[600px] w-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-10 shadow-xl shadow-blue-900/5 text-center relative overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-400/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative w-24 h-24 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-gray-50 stroke-current"
              strokeWidth="6"
              cx="50" cy="50" r="46"
              fill="transparent"
            ></circle>
            <motion.circle
              className="text-blue-600 stroke-current drop-shadow-sm"
              strokeWidth="6"
              strokeLinecap="round"
              cx="50" cy="50" r="46"
              fill="transparent"
              initial={{ strokeDasharray: '0 289' }}
              animate={{ strokeDasharray: `${(progress / 100) * 289} 289` }}
              transition={{ duration: 0.2, ease: 'linear' }}
            ></motion.circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {progress >= 100 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </motion.div>
            ) : (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">Generating Architecture</h2>
        <p className="text-sm text-gray-500 mb-10">Our AI architect is analyzing your requirements...</p>

        <div className="space-y-5 text-left">
          {STAGES.map((stage, index) => {
            const isCompleted = currentStage > index || progress >= 100;
            const isCurrent = currentStage === index && progress < 100;
            const isPending = currentStage < index;

            return (
              <div key={stage.id} className="flex items-center gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-300 ${
                  isCompleted ? 'bg-blue-600 text-white shadow-sm' : 
                  isCurrent ? 'bg-blue-100 text-blue-600' : 
                  'bg-gray-50 text-gray-300 border border-gray-100'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <stage.icon className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />}
                </div>
                
                {/* Connecting Line */}
                {index < STAGES.length - 1 && (
                  <div className="absolute top-8 left-4 bottom-[-20px] w-0.5 bg-gray-100 -translate-x-1/2 -z-10" />
                )}

                <span className={`text-sm transition-all duration-300 ${
                  isCompleted ? 'text-gray-900 font-medium' : 
                  isCurrent ? 'text-blue-700 font-medium' : 
                  'text-gray-400'
                }`}>
                  {stage.label}
                </span>
                
                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-auto flex gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
