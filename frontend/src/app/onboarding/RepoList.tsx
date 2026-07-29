'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  updated_at: string;
};

export default function RepoList({ repos }: { repos: GitHubRepo[] }) {
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const router = useRouter();

  const filteredRepos = repos.filter((repo) =>
    repo.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConnect = async (repo: GitHubRepo) => {
    setLoadingId(repo.id);
    try {
      const res = await fetch('/api/repos/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_repo_id: repo.id.toString(),
          name: repo.name,
          full_name: repo.full_name,
        }),
      });

      if (!res.ok) throw new Error('Failed to connect repo');
      const data = await res.json();
      
      if (data.redirect) {
        router.push(data.redirect);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to connect repository. Please try again.');
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Select a Repository to Connect</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search repositories..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {filteredRepos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No repositories found.</p>
        ) : (
          filteredRepos.map((repo) => (
            <div
              key={repo.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{repo.full_name}</h3>
                {repo.description && (
                  <p className="text-sm text-gray-500 truncate max-w-md mt-1">{repo.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Last updated: {new Date(repo.updated_at).toLocaleDateString()}
                </p>
              </div>
              
              <button
                onClick={() => handleConnect(repo)}
                disabled={loadingId === repo.id}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loadingId === repo.id ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
