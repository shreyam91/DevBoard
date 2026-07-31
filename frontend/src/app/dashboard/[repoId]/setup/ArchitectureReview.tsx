'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit2, Save, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { approveAndCommitArchitecture } from '@/app/actions/setup';
import { useRouter } from 'next/navigation';

export default function ArchitectureReview({
  repoId,
  jobId,
  draftMarkdown,
  draftDecisions
}: {
  repoId: string;
  jobId: string;
  draftMarkdown: string;
  draftDecisions: any[];
}) {
  const [markdown, setMarkdown] = useState(draftMarkdown);
  const [decisions, setDecisions] = useState(draftDecisions || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDecision, setEditingDecision] = useState<number | null>(null);
  const router = useRouter();

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveAndCommitArchitecture(repoId, jobId, markdown, decisions);
      router.push(`/dashboard/${repoId}`);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const updateDecision = (index: number, field: string, value: string) => {
    const newDecisions = [...decisions];
    newDecisions[index] = { ...newDecisions[index], [field]: value };
    setDecisions(newDecisions);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Architecture Draft Ready
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review the generated architecture and decisions before committing to your repository.
          </p>
        </div>
        <button
          onClick={handleApprove}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            'Committing...'
          ) : (
            <>
              <Check className="w-4 h-4" />
              Approve & Commit
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-6">
        {/* Left Pane: Markdown Review */}
        <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
            <FileCode className="w-4 h-4 text-gray-500" />
            <h2 className="font-medium text-gray-700 text-sm">ARCHITECTURE.md</h2>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 w-full p-4 resize-none outline-none font-mono text-sm text-gray-800 bg-transparent"
          />
        </div>

        {/* Right Pane: Extracted Decisions */}
        <div className="lg:w-96 flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-medium text-gray-900">Extracted Decisions</h2>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
              {decisions.length}
            </span>
          </div>

          {decisions.map((decision, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              {editingDecision === index ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={decision.title}
                    onChange={(e) => updateDecision(index, 'title', e.target.value)}
                    className="w-full text-sm font-medium border-b border-gray-200 pb-1 outline-none focus:border-blue-500"
                  />
                  <textarea
                    value={decision.rationale}
                    onChange={(e) => updateDecision(index, 'rationale', e.target.value)}
                    className="w-full text-sm text-gray-600 h-24 resize-none outline-none border border-gray-200 rounded p-2 focus:border-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditingDecision(null)}
                      className="text-xs font-medium text-blue-600 flex items-center gap-1 hover:text-blue-700"
                    >
                      <Save className="w-3 h-3" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-gray-900 text-sm leading-snug">
                      {decision.title}
                    </h3>
                    <button
                      onClick={() => setEditingDecision(index)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {decision.rationale}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium capitalize">
                    {decision.category.toLowerCase().replace('_', ' ')}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          
          {decisions.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3 text-yellow-800">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">No structural decisions were extracted from the draft. You can proceed, but DevBoard's AI memory will be limited.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
