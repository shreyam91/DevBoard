"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  loading = false,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={!loading ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDestructive ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-blue/10 text-accent-blue'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <button 
                  onClick={onClose}
                  disabled={loading}
                  className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-[18px] font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-[14px] text-slate-500 leading-relaxed mb-6">
                {description}
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[14px] font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 py-2.5 px-4 text-white text-[14px] font-semibold rounded-xl transition-colors disabled:opacity-50 ${
                    isDestructive ? 'bg-accent-red hover:bg-accent-red/90' : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {loading ? 'Processing...' : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
