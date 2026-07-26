"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function SettingsClient({ repoId }: { repoId: string }) {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
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
      toast.success('Repository deleted successfully');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
      setLoadingDelete(false);
      setIsDeleteModalOpen(false);
    }
  };

  const executeDisconnect = async () => {
    toast.error("Disconnect feature is not fully implemented yet.");
    setIsDisconnectModalOpen(false);
  };

  return (
    <>
      <div className="bg-white border border-accent-red/30 shadow-sm rounded-2xl overflow-hidden">
        
        <div className="p-6 flex items-center justify-between">
          <div>
            <h4 className="text-[14px] font-bold text-slate-900 mb-1">Disconnect Repository</h4>
            <p className="text-[13px] text-slate-500 max-w-lg leading-relaxed">
              Once you disconnect a repository, DevBoard will stop tracking future pull requests. 
              However, your existing architectural decisions will remain in the DevBoard dashboard.
            </p>
          </div>
          <button 
            onClick={() => setIsDisconnectModalOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-accent-red text-[13px] font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            Disconnect Repo
          </button>
        </div>

        <div className="h-px bg-accent-red/10"></div>

        <div className="p-6 flex items-center justify-between bg-accent-red/5">
          <div>
            <h4 className="text-[14px] font-bold text-accent-red mb-1">Delete Repository Data</h4>
            <p className="text-[13px] text-accent-red/80 max-w-lg leading-relaxed">
              This will permanently delete all architectural decisions, conflicts, and webhooks associated with this repository. This action cannot be undone.
            </p>
          </div>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={loadingDelete}
            className="px-4 py-2 bg-accent-red hover:bg-accent-red/90 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {loadingDelete ? "Deleting..." : "Delete Data"}
          </button>
        </div>

      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="Delete Repository Data"
        description="Are you sure you want to permanently delete all data for this repository? This will wipe all architectural decisions, conflicts, and webhooks. This action cannot be undone."
        confirmText="Delete Data"
        isDestructive={true}
        loading={loadingDelete}
      />

      <ConfirmModal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={executeDisconnect}
        title="Disconnect Repository"
        description="Are you sure you want to disconnect? Webhooks will be removed but data will be kept."
        confirmText="Disconnect"
        isDestructive={true}
      />
    </>
  );
}
