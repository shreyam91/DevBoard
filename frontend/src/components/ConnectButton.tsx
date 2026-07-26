"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ConnectRepoModal } from "./ConnectRepoModal";

export function ConnectButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Connect Repository
      </button>
      
      <ConnectRepoModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onConnected={() => {
          // Handled internally by modal redirecting
        }}
      />
    </>
  );
}
