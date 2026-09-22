// src/components/ui/Toast.tsx
// Global micro-interaction toast notification matching prototype_mobile_first.html (#toast-success)

import React from 'react';
import { createPortal } from 'react-dom';
import { Check, X, AlertCircle } from 'lucide-react';
import { useToastStore } from '../../stores/useToastStore';
import { cn } from '../../lib/utils';

export const Toast: React.FC = () => {
  const { toast, isOpen, hideToast } = useToastStore();

  if (!toast && !isOpen) return null;

  return createPortal(
    <div
      id="toast-success"
      className={cn(
        'fixed top-5 left-4 right-4 max-w-sm mx-auto z-[9999] transition-all duration-300 transform pointer-events-none',
        isOpen
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-4 opacity-0 pointer-events-none'
      )}
      role="status"
      aria-live="polite"
    >
      <div className="theme-surface rounded-2xl p-3 border border-slate-200/80 dark:border-white/[0.12] neo-card glow-brand flex items-center gap-3 backdrop-blur-xl shadow-2xl">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border',
            toast?.type === 'error'
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
          )}
        >
          {toast?.type === 'error' ? (
            <AlertCircle className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <Check className="w-4 h-4 stroke-[3]" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white" id="toast-title">
            {toast?.title || 'Action Successful!'}
          </h4>
          {toast?.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" id="toast-desc">
              {toast.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={hideToast}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          title="ปิด"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>,
    document.body
  );
};
