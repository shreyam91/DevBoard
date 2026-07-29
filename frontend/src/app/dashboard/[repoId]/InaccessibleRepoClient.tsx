"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function InaccessibleRepoClient({ repoId }: { repoId: string }) {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const executeDelete = async () => {
    setLoadingDelete(true);
    try {
      const res = await fetch(`/api/repos/${repoId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Failed to delete repository');
      }
      toast.success('Repository removed successfully');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
      setLoadingDelete(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-accent-red/30 shadow-2xl rounded-2xl p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-accent-red/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-accent-red" />
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 mb-3">
          Repository Inaccessible
        </h2>
        
        <p className="text-[14px] text-slate-600 mb-8 leading-relaxed">
          This repository was deleted on GitHub, or the DevBoard app lost access. 
          You can no longer view or sync data for this repository.
        </p>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="w-full px-6 py-3 bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          Remove from DevBoard
        </button>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="Remove Repository"
        description="Are you sure you want to remove this repository and all its associated data from DevBoard? This action cannot be undone."
        confirmText="Remove Repository"
        isDestructive={true}
        loading={loadingDelete}
      />
    </div>
  );
}
