'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Search, Cpu, Database, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { checkInitializationStatus, startArchaeologyJob } from '@/app/actions/setup';
import { useRouter } from 'next/navigation';

export default function ArchaeologyLoader({ 
  repoId, 
  repoFullName,
  initializationStatus,
  latestJob
}: { 
  repoId: string;
  repoFullName: string;
  initializationStatus: string;
  latestJob: any;
}) {
  const router = useRouter();
  const [statusText, setStatusText] = useState('Queuing archaeology job...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // If pending, start the job
    if (initializationStatus === 'pending') {
      startArchaeologyJob(repoId, repoFullName).catch(console.error);
    }
  }, [initializationStatus, repoId, repoFullName]);

  useEffect(() => {
    let interval = setInterval(async () => {
      if (initializationStatus !== 'completed' && initializationStatus !== 'review') {
        const { initialization_status, latestJob } = await checkInitializationStatus(repoId);
        
        if (initialization_status === 'review' || latestJob?.status === 'review_pending') {
          router.refresh();
        } else if (latestJob?.status === 'processing') {
          setStatusText('Analyzing repository history & structure...');
          setProgress((p) => (p < 80 ? p + 5 : p));
        } else if (latestJob?.status === 'failed') {
          setStatusText('Archaeology failed. Please contact support.');
          clearInterval(interval);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [initializationStatus, repoId, router]);

  // Fake progressive loading for UI wow factor
  useEffect(() => {
    if (progress < 90 && initializationStatus === 'in_progress') {
      const timer = setTimeout(() => {
        setProgress((p) => p + Math.random() * 10);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [progress, initializationStatus]);

  const steps = [
    { icon: Search, label: 'Cloning repository temporarily', done: progress > 10 },
    { icon: Database, label: 'Extracting Git history & commits', done: progress > 40 },
    { icon: Network, label: 'Detecting frameworks & infra', done: progress > 60 },
    { icon: Cpu, label: 'Generating architecture draft', done: progress > 85 },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center"
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-gray-100 stroke-current"
              strokeWidth="8"
              cx="50" cy="50" r="40"
              fill="transparent"
            ></circle>
            <motion.circle
              className="text-blue-600 stroke-current"
              strokeWidth="8"
              strokeLinecap="round"
              cx="50" cy="50" r="40"
              fill="transparent"
              initial={{ strokeDasharray: '0 251.2' }}
              animate={{ strokeDasharray: `${(progress / 100) * 251.2} 251.2` }}
              transition={{ duration: 0.5 }}
            ></motion.circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Repository</h2>
        <p className="text-sm text-gray-500 mb-8">{statusText}</p>

        <div className="space-y-4 text-left">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {step.done ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
              </div>
              <span className={`text-sm ${step.done ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
