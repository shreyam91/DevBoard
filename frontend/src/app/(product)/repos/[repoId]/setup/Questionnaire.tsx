'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { saveQuestionnaireDraft } from '@/app/actions/setup';

export type QuestionType = 'single_select' | 'multi_select' | 'textarea';

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
}

const BASE_QUESTIONS: Question[] = [
  {
    id: 'project_purpose',
    title: 'What is the primary business purpose of this project?',
    subtitle: 'Describe what problem it solves.',
    type: 'textarea',
    placeholder: 'e.g. A B2B SaaS platform that helps dentists manage patient appointments...'
  },
  {
    id: 'core_features',
    title: 'What are the absolute core features?',
    subtitle: 'List 3-5 non-negotiable features for MVP.',
    type: 'textarea',
    placeholder: '1. User authentication\n2. Real-time calendar syncing\n3. Automated SMS reminders'
  },
  {
    id: 'data_sensitivity',
    title: 'Does this project handle sensitive data?',
    type: 'single_select',
    options: ['No sensitive data', 'PII (Personal Identifiable Information)', 'PHI (Health Data - HIPAA)', 'Financial Data (PCI)', 'Highly Classified']
  },
  {
    id: 'expected_traffic',
    title: 'What is the expected traffic pattern?',
    type: 'single_select',
    options: ['Steady, predictable traffic', 'Highly spiky (e.g. ticket sales)', 'Low internal traffic', 'Global high-throughput']
  },
  {
    id: 'key_integrations',
    title: 'Will you rely heavily on third-party integrations?',
    type: 'multi_select',
    options: ['Payment Gateways (Stripe, etc.)', 'LLMs/AI APIs', 'CRM/ERP Systems', 'Social Logins', 'Email/SMS Providers', 'Legacy Systems']
  }
];

export default function Questionnaire({ 
  repoId, 
  initialAnswers,
  onSubmit
}: { 
  repoId: string;
  initialAnswers: any;
  onSubmit: (answers: any) => void;
}) {
  const [questions, setQuestions] = useState<Question[]>(BASE_QUESTIONS);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers || {});
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [hasGeneratedFollowUps, setHasGeneratedFollowUps] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept enter if they are typing in a textarea
      if (e.key === 'Enter' && e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Enter') {
        const question = questions[currentStep];
        if (question && question.type === 'single_select' && answers[question.id]) {
          handleNext();
        } else if (question && question.type === 'multi_select' && answers[question.id]?.length > 0) {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, answers]);

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1);
      await saveQuestionnaireDraft(repoId, answers).catch(console.error);
    } else if (currentStep === questions.length - 1) {
      if (!hasGeneratedFollowUps) {
        setIsGeneratingQuestions(true);
        try {
          const res = await fetch(`/api/repos/${repoId}/setup/interview`, {
            method: 'POST',
            body: JSON.stringify({ answers })
          });
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            const aiQuestions = data.questions.map((q: any) => ({
              id: q.id,
              title: q.title,
              type: 'textarea',
              placeholder: q.placeholder || 'Your answer...',
              subtitle: '✨ AI Generated Follow-up'
            }));
            setQuestions(prev => [...prev, ...aiQuestions]);
          }
        } catch (e) {
          console.error('Failed to generate interview questions', e);
        } finally {
          setHasGeneratedFollowUps(true);
          setIsGeneratingQuestions(false);
          setCurrentStep(s => s + 1);
          await saveQuestionnaireDraft(repoId, answers).catch(console.error);
        }
      } else {
        setCurrentStep(s => s + 1);
        await saveQuestionnaireDraft(repoId, answers).catch(console.error);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const selectSingleOption = (questionId: string, option: string) => {
    const newAnswers = { ...answers, [questionId]: option };
    setAnswers(newAnswers);
    // Auto advance for single select
    setTimeout(() => {
      setCurrentStep(s => s + 1);
      saveQuestionnaireDraft(repoId, newAnswers).catch(console.error);
    }, 250);
  };

  const toggleMultiOption = (questionId: string, option: string) => {
    const current = answers[questionId] || [];
    const newAnswers = { ...answers };
    
    if (current.includes(option)) {
      newAnswers[questionId] = current.filter((o: string) => o !== option);
    } else {
      newAnswers[questionId] = [...current, option];
    }
    setAnswers(newAnswers);
  };

  const renderSummary = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Ready to generate</h2>
          <p className="text-gray-500">Review your choices before DevBoard drafts your architecture.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {Object.entries(answers).map(([key, val]) => {
              const q = questions.find(q => q.id === key);
              if (!q || !val || (Array.isArray(val) && val.length === 0)) return null;
              return (
                <div key={key} className={q.type === 'textarea' ? "col-span-1 md:col-span-2 pt-4 border-t border-gray-100" : ""}>
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <p className="text-sm font-medium text-gray-500">{q.title}</p>
                    <button 
                      onClick={() => setCurrentStep(questions.findIndex(x => x.id === key))}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap bg-blue-50 px-2 py-1 rounded-md"
                    >
                      Edit
                    </button>
                  </div>
                  {Array.isArray(val) ? (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {val.map((p: string) => (
                        <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">{val}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderQuestion = () => {
    if (isGeneratingQuestions) {
      return (
        <motion.div
          key="generating"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Analyzing your answers...</h2>
          <p className="text-gray-500 text-center max-w-sm">
            AI is preparing a few specific follow-up questions about your architecture.
          </p>
        </motion.div>
      );
    }

    if (currentStep === questions.length) {
      return renderSummary();
    }

    const question = questions[currentStep];

    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">
            {question.title}
          </h2>
          {question.subtitle && (
            <p className="text-gray-500 text-lg">{question.subtitle}</p>
          )}
        </div>

        {question.type === 'single_select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options?.map((option) => {
              const isSelected = answers[question.id] === option;
              return (
                <button
                  key={option}
                  onClick={() => selectSingleOption(question.id, option)}
                  className={`flex items-center justify-between p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                    {option}
                  </span>
                  {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                </button>
              );
            })}
          </div>
        )}

        {question.type === 'multi_select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options?.map((option) => {
              const isSelected = (answers[question.id] || []).includes(option);
              return (
                <button
                  key={option}
                  onClick={() => toggleMultiOption(question.id, option)}
                  className={`flex items-center justify-between p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                    {option}
                  </span>
                  {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                </button>
              );
            })}
          </div>
        )}

        {question.type === 'textarea' && (
          <textarea
            autoFocus
            value={answers[question.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            placeholder={question.placeholder}
            className="w-full h-64 p-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 resize-none outline-none text-gray-900 placeholder-gray-400 transition-all shadow-sm"
          />
        )}
      </motion.div>
    );
  };

  const progressPercentage = (currentStep / questions.length) * 100;

  return (
    <div className="flex-1 flex flex-col min-h-[600px] bg-white relative" ref={containerRef}>
      {/* Progress Header */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
        <motion.div 
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col">
        <div className="w-full my-auto">
          {currentStep < questions.length && !isGeneratingQuestions && (
            <div className="max-w-2xl mx-auto mb-8 text-sm font-medium tracking-wider text-blue-600 uppercase">
              Step {currentStep + 1} of {questions.length}
            </div>
          )}
          <AnimatePresence mode="wait">
            {renderQuestion()}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-gray-100 bg-white p-6 md:px-12 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-600 disabled:opacity-30 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {currentStep === questions.length ? (
          <button
            onClick={() => onSubmit(answers)}
            className="flex items-center gap-2 px-8 py-3.5 text-base font-medium text-white bg-black rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Approve & Generate Architecture
            <Sparkles className="w-4 h-4 ml-1" />
          </button>
        ) : isGeneratingQuestions ? (
           <div /> 
        ) : (
          <div className="flex items-center gap-4">
            {(questions[currentStep]?.type === 'textarea' || questions[currentStep]?.type === 'multi_select') && (
              <button
                onClick={() => handleNext()}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-4 py-2"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                questions[currentStep]?.type === 'single_select' && !answers[questions[currentStep].id]
              }
              className="flex items-center gap-2 px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
