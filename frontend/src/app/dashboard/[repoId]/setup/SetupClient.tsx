'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, ChevronRight, FileCode, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Questionnaire from './Questionnaire';
import ArchaeologyLoader from './ArchaeologyLoader';
import ArchitectureReview from './ArchitectureReview';
import GenerationLoader from './GenerationLoader';
import { submitQuestionnaire } from '@/app/actions/setup';

export default function SetupClient({ 
  repoId, 
  repoFullName,
  isNewRepo,
  initializationStatus,
  latestJob,
  initialQuestionnaire
}: { 
  repoId: string;
  repoFullName: string;
  isNewRepo: boolean;
  initializationStatus: string;
  latestJob: any;
  initialQuestionnaire: any;
}) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  // If status is completed, redirect to overview
  useEffect(() => {
    if (initializationStatus === 'completed') {
      router.push(`/dashboard/${repoId}`);
    }
  }, [initializationStatus, repoId, router]);

  // Determine what to render
  if (initializationStatus === 'review' || (latestJob && latestJob.status === 'review_pending')) {
    return (
      <ArchitectureReview 
        repoId={repoId} 
        jobId={latestJob?.id}
        draftMarkdown={latestJob?.draft_markdown || ''}
        draftDecisions={latestJob?.draft_decisions || []}
      />
    );
  }

  if (initializationStatus === 'pending' && !isGenerating) {
    return (
      <Questionnaire 
        repoId={repoId} 
        initialAnswers={initialQuestionnaire}
        onSubmit={async (answers) => {
          setIsGenerating(true);
          try {
            await submitQuestionnaire(repoId);
          } catch (e) {
            console.error('Failed to submit questionnaire:', e);
            setIsGenerating(false);
          }
        }}
      />
    );
  }

  if (isNewRepo && (initializationStatus === 'in_progress' || isGenerating)) {
    return <GenerationLoader repoId={repoId} />;
  }

  return (
    <ArchaeologyLoader 
      repoId={repoId} 
      repoFullName={repoFullName}
      initializationStatus={initializationStatus} 
      latestJob={latestJob} 
    />
  );
}
