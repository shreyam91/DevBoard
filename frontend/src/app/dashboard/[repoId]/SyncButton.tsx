"use client";

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SyncButton({ repoId }: { repoId: string }) {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/repos/${repoId}/sync`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to sync');
      toast.success('Repository synchronized');
      // The SSE stream or SWR should pick up changes if implemented on the overview, 
      // but a full reload is also fine here if they just clicked sync manually.
      window.location.reload();
    } catch (error) {
      toast.error('Failed to sync repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSync}
      disabled={loading}
      className="h-[36px] px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
      <span className="text-[13px] font-semibold text-slate-700">{loading ? 'Syncing...' : 'Sync Data'}</span>
    </button>
  );
}
