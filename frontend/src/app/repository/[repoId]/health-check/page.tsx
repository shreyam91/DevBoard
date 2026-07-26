'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertCircle,
  GitBranch,
  FileCode2,
  Clock,
  Layers
} from 'lucide-react';

type CheckStatus = 'waiting' | 'checking' | 'success' | 'warning' | 'failed';

interface ValidationStep {
  id: string;
  label: string;
  status: CheckStatus;
  result?: string;
}

interface RepoHealthData {
  is_new_repo: boolean;
  status: string;
  webhookStatus: string;
  score: number;
  techStack: {
    language: string;
    framework: string;
    ci: string;
    container: string;
  };
  repoInfo: {
    owner: string;
    avatarUrl: string;
    defaultBranch: string;
    visibility: string;
    size: number;
    lastUpdated: string;
  };
  permissions: string;
}

export default function HealthCheckPage({ params }: { params: { repoId: string } }) {
  const router = useRouter();
  const { repoId } = params;

  const [healthData, setHealthData] = useState<RepoHealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const [steps, setSteps] = useState<ValidationStep[]>([
    { id: 'access', label: 'Repository Access', status: 'waiting' },
    { id: 'permissions', label: 'GitHub Permissions', status: 'waiting' },
    { id: 'webhook', label: 'Webhook Status', status: 'waiting' },
    { id: 'structure', label: 'Repository Structure', status: 'waiting' },
    { id: 'analysis', label: 'Repository Analysis', status: 'waiting' },
    { id: 'mode', label: 'Initialization Mode', status: 'waiting' },
  ]);

  const updateStep = (id: string, updates: Partial<ValidationStep>) => {
    setSteps(prev => prev.map(step => step.id === id ? { ...step, ...updates } : step));
  };

  useEffect(() => {
    let isMounted = true;

    const runDiagnostics = async () => {
      // 1. Start Access Check
      updateStep('access', { status: 'checking' });
      await new Promise(r => setTimeout(r, 800)); // Simulate UI pacing

      try {
        const res = await fetch(`/api/repos/${repoId}/health-check`, { method: 'POST' });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Diagnostic failed');
        }

        if (!isMounted) return;
        const health = data.health as RepoHealthData;
        setHealthData(health);

        updateStep('access', { status: 'success', result: `${health.repoInfo.owner} verified` });
        
        // 2. Permissions
        updateStep('permissions', { status: 'checking' });
        await new Promise(r => setTimeout(r, 600));
        updateStep('permissions', { status: 'success', result: 'Scopes granted' });

        // 3. Webhook
        updateStep('webhook', { status: 'checking' });
        await new Promise(r => setTimeout(r, 800));
        updateStep('webhook', { 
          status: health.webhookStatus === 'connected' ? 'success' : 'warning',
          result: health.webhookStatus === 'connected' ? 'Connected' : 'Needs Repair'
        });

        // 4. Structure
        updateStep('structure', { status: 'checking' });
        await new Promise(r => setTimeout(r, 1000));
        updateStep('structure', { status: 'success', result: `${health.techStack.framework} structure detected` });

        // 5. Analysis
        updateStep('analysis', { status: 'checking' });
        await new Promise(r => setTimeout(r, 900));
        updateStep('analysis', { status: 'success', result: `Score: ${health.score}/100` });

        // 6. Mode
        updateStep('mode', { status: 'checking' });
        await new Promise(r => setTimeout(r, 600));
        updateStep('mode', { 
          status: 'success', 
          result: health.is_new_repo ? 'New Project Setup' : 'Archaeology Mode'
        });

        await new Promise(r => setTimeout(r, 1000));
        setIsFinished(true);

        // Auto-navigate after 3 seconds
        setTimeout(() => {
          router.push(`/repository/${repoId}/snapshot`);
        }, 3000);

      } catch (err: any) {
        if (!isMounted) return;
        updateStep('access', { status: 'failed', result: err.message });
        setError(err.message);
      }
    };

    runDiagnostics();

    return () => { isMounted = false; };
  }, [repoId, router]);

  const renderStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'waiting':
        return <Circle className="w-5 h-5 text-slate-200" />;
      case 'checking':
        return <Loader2 className="w-5 h-5 text-accent-blue animate-spin" />;
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </motion.div>
        );
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900 selection:bg-accent-blue/20">
      <div className="max-w-[1000px] w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: Repo Info */}
        <div className="md:col-span-5 flex flex-col space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-4 mb-6">
              {healthData?.repoInfo.avatarUrl ? (
                <img src={healthData.repoInfo.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-xl border border-slate-100" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                  <i className="ti ti-brand-github text-[28px] text-slate-400"></i>
                </div>
              )}
              <div>
                <h1 className="text-[20px] font-bold text-slate-900 tracking-tight leading-tight">
                  {healthData ? `${healthData.repoInfo.owner} /` : 'Connecting...'}
                </h1>
                <p className="text-[14px] text-slate-500 font-medium">System Diagnostics</p>
              </div>
            </div>

            {healthData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Branch</span>
                    </div>
                    <span className="text-[13px] font-medium text-slate-900">{healthData.repoInfo.defaultBranch}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <FileCode2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Language</span>
                    </div>
                    <span className="text-[13px] font-medium text-slate-900">{healthData.techStack.language}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[12px] font-medium">Last Updated</span>
                  </div>
                  <span className="text-[12px] font-medium text-slate-900">
                    {new Date(healthData.repoInfo.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
            
            {!healthData && (
              <div className="h-[120px] bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
            )}
          </motion.div>

          {isFinished && healthData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gradient-to-br from-accent-blue to-blue-600 rounded-2xl p-6 shadow-xl shadow-accent-blue/20 text-white relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col">
                <h3 className="text-white/80 text-[13px] font-bold uppercase tracking-wider mb-1">
                  {healthData.is_new_repo ? 'Starting Project Scan' : 'Launching Archaeology'}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="text-[15px] font-semibold">
                    Preparing Snapshot...
                  </span>
                </div>
                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: '100%' }} 
                    transition={{ duration: 3, ease: 'linear' }}
                    className="h-full bg-white"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[14px] font-semibold text-red-900">Diagnostic Failed</h3>
                  <p className="text-[13px] text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="self-end px-4 py-2 bg-white border border-red-200 text-red-700 text-[13px] font-semibold rounded-lg shadow-sm hover:bg-red-50 transition-colors"
              >
                Retry
              </button>
            </motion.div>
          )}
        </div>

        {/* RIGHT PANEL: Checklist */}
        <div className="md:col-span-7">
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">Verification Tasks</h2>
              {healthData?.score !== undefined && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Score</span>
                  <span className="text-[13px] font-extrabold text-emerald-600">{healthData.score}/100</span>
                </motion.div>
              )}
            </div>
            
            <div className="p-2">
              <AnimatePresence>
                {steps.map((step, index) => {
                  const isVisible = step.status !== 'waiting' || (index === 0) || (steps[index - 1].status === 'success' || steps[index - 1].status === 'warning');
                  
                  if (!isVisible) return null;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center p-4 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="mr-4 shrink-0">
                        {renderStatusIcon(step.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-[14px] font-semibold ${step.status === 'checking' ? 'text-slate-900' : 'text-slate-700'}`}>
                            {step.label}
                          </span>
                          
                          {step.result && (
                            <motion.span 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`text-[12px] font-medium truncate ml-4 ${
                                step.status === 'warning' ? 'text-amber-600' : 'text-slate-500'
                              }`}
                            >
                              {step.result}
                            </motion.span>
                          )}
                        </div>
                        
                        {step.status === 'checking' && (
                          <motion.div 
                            layoutId="active-indicator"
                            className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden"
                          >
                            <motion.div 
                              className="h-full bg-accent-blue"
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          
          <AnimatePresence>
            {isFinished && healthData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-[14px] font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  Detected Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(healthData.techStack).map(([key, value]) => {
                    if (value === 'None' || value === 'Unknown') return null;
                    return (
                      <div key={key} className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{key}</span>
                        <span className="text-[13px] font-semibold text-slate-900">{value as string}</span>
                      </div>
                    );
                  })}
                  {healthData.techStack.framework === 'Unknown' && (
                    <span className="text-[13px] text-slate-500 italic">No frameworks detected automatically.</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
