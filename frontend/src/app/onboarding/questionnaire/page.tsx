'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

function QuestionnaireForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoId = searchParams.get('repoId');

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    building: '',
    scale: 'personal project',
    language: '',
    database: 'relational',
    deployment: 'Vercel',
    constraints: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!repoId) return toast.error('Repository ID is missing.');
    setLoading(true);

    try {
      const res = await fetch('/api/repos/generate-architecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoId,
          answers: formData,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit questionnaire');
      
      router.push('/overview');
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 px-6 py-8 sm:p-10">
          <h2 className="text-3xl font-extrabold text-white">Let&apos;s Design Your Architecture</h2>
          <p className="mt-2 text-blue-100">Tell us a bit about your new project to kickstart your architecture design.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-8 sm:p-10 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">What are you building?</label>
            <input
              required
              name="building"
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., A social media app for pets"
              value={formData.building}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected scale?</label>
            <div className="space-y-2">
              {['personal project', 'small team', 'production SaaS'].map((scale) => (
                <div key={scale} className="flex items-center">
                  <input
                    type="radio"
                    name="scale"
                    value={scale}
                    checked={formData.scale === scale}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-3 block text-sm text-gray-700 capitalize">{scale}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Primary language/framework?</label>
            <input
              required
              name="language"
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Next.js, Node, Python, Django"
              value={formData.language}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Will you use a database? If yes, what type?</label>
            <select
              name="database"
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.database}
              onChange={handleChange}
            >
              <option value="relational">Relational (e.g., PostgreSQL, MySQL)</option>
              <option value="document">Document / NoSQL (e.g., MongoDB)</option>
              <option value="both">Both</option>
              <option value="none">None</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deployment target?</label>
            <select
              name="deployment"
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.deployment}
              onChange={handleChange}
            >
              <option value="Vercel">Vercel / Netlify</option>
              <option value="AWS">AWS</option>
              <option value="GCP">Google Cloud Platform</option>
              <option value="self-hosted">Self-hosted / VPS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Any hard constraints? <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              name="constraints"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Must use WebSockets, requires strict GDPR compliance"
              value={formData.constraints}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Submitting...' : 'Generate Architecture'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <QuestionnaireForm />
    </Suspense>
  );
}
