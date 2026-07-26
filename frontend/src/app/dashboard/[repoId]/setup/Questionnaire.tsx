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

const QUESTIONS: Question[] = [
  {
    id: 'project_type',
    title: 'What are you building?',
    subtitle: 'This helps us generate architecture recommendations.',
    type: 'single_select',
    options: ['SaaS Application', 'AI Application', 'E-commerce', 'Internal Tool', 'Mobile Backend', 'Developer Tool', 'Open Source Project', 'Portfolio', 'Other']
  },
  {
    id: 'primary_goal',
    title: 'What is your primary goal?',
    type: 'single_select',
    options: ['MVP', 'Production Product', 'Enterprise Software', 'Client Project', 'Learning Project', 'Open Source']
  },
  {
    id: 'user_scale',
    title: 'Expected user scale?',
    type: 'single_select',
    options: ['Under 1,000', '1k–10k', '10k–100k', '100k+', 'Not Sure']
  },
  {
    id: 'frontend',
    title: 'Frontend framework',
    type: 'single_select',
    options: ['Next.js', 'React', 'Vue', 'Angular', 'Svelte', 'No Frontend', 'Other']
  },
  {
    id: 'backend',
    title: 'Backend',
    type: 'single_select',
    options: ['Next.js API', 'Express', 'NestJS', 'FastAPI', 'Django', 'Spring Boot', 'Go', 'Serverless', 'Other']
  },
  {
    id: 'database',
    title: 'Preferred database',
    type: 'single_select',
    options: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Supabase', 'Firebase', 'DynamoDB', "Haven't Decided"]
  },
  {
    id: 'authentication',
    title: 'Authentication',
    type: 'single_select',
    options: ['Auth.js / NextAuth', 'Clerk', 'Firebase Auth', 'Supabase Auth', 'Auth0', 'JWT', 'OAuth Only', 'No Authentication']
  },
  {
    id: 'deployment',
    title: 'Deployment platform',
    type: 'single_select',
    options: ['Vercel', 'Railway', 'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'DigitalOcean', 'Not Decided']
  },
  {
    id: 'team_size',
    title: 'Team size',
    type: 'single_select',
    options: ['Solo Developer', '2–5 Developers', '5–20 Developers', '20+ Developers']
  },
  {
    id: 'architecture',
    title: 'Preferred architecture',
    type: 'single_select',
    options: ['Monolith', 'Modular Monolith', 'Microservices', 'Serverless', 'Monorepo', 'Multi Repository', 'Not Sure']
  },
  {
    id: 'priorities',
    title: 'What matters most?',
    subtitle: 'Allow multiple selections.',
    type: 'multi_select',
    options: ['Fast Development', 'Scalability', 'Maintainability', 'Performance', 'Security', 'Low Cost', 'Reliability', 'Developer Experience']
  },
  {
    id: 'additional_notes',
    title: 'Anything else the AI should know?',
    type: 'textarea',
    placeholder: 'Examples:\n• Must support multi-tenancy\n• GDPR compliance required\n• Offline-first\n• AI-heavy workloads\n• HIPAA compliance\n• API-first product\n• Budget constraints'
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
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers || {});
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept enter if they are typing in a textarea
      if (e.key === 'Enter' && e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Enter') {
        const question = QUESTIONS[currentStep];
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
    if (currentStep < QUESTIONS.length) {
      setCurrentStep(s => s + 1);
      await saveQuestionnaireDraft(repoId, answers).catch(console.error);
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
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Repository Type</p>
              <p className="text-gray-900">{answers['project_type'] || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Frontend</p>
              <p className="text-gray-900">{answers['frontend'] || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Backend</p>
              <p className="text-gray-900">{answers['backend'] || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Database</p>
              <p className="text-gray-900">{answers['database'] || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Authentication</p>
              <p className="text-gray-900">{answers['authentication'] || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Deployment</p>
              <p className="text-gray-900">{answers['deployment'] || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Architecture</p>
              <p className="text-gray-900">{answers['architecture'] || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Priorities</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(answers['priorities'] || []).map((p: string) => (
                  <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                    {p}
                  </span>
                ))}
                {(!answers['priorities'] || answers['priorities'].length === 0) && '—'}
              </div>
            </div>
          </div>
          
          {(answers['additional_notes']?.trim()) && (
            <div className="pt-6 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-2">Additional Notes</p>
              <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">{answers['additional_notes']}</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderQuestion = () => {
    if (currentStep === QUESTIONS.length) {
      return renderSummary();
    }

    const question = QUESTIONS[currentStep];

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

  const progressPercentage = (currentStep / QUESTIONS.length) * 100;

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

      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="w-full">
          {currentStep < QUESTIONS.length && (
            <div className="max-w-2xl mx-auto mb-8 text-sm font-medium tracking-wider text-blue-600 uppercase">
              Step {currentStep + 1} of {QUESTIONS.length}
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

        {currentStep === QUESTIONS.length ? (
          <button
            onClick={() => onSubmit(answers)}
            className="flex items-center gap-2 px-8 py-3.5 text-base font-medium text-white bg-black rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Generate ARCHITECTURE.md
            <Sparkles className="w-4 h-4 ml-1" />
          </button>
        ) : (
          <div className="flex items-center gap-4">
            {(QUESTIONS[currentStep]?.type === 'textarea' || QUESTIONS[currentStep]?.type === 'multi_select') && (
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
                QUESTIONS[currentStep]?.type === 'single_select' && !answers[QUESTIONS[currentStep].id]
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
