// src/components/ui/Modal.tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const isSmallConfirm = maxWidth === 'sm';

  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-[60] flex justify-center',
        isSmallConfirm ? 'items-center p-4' : 'items-end sm:items-center p-0 sm:p-4'
      )}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog: Center-card for sm confirm dialogs on all viewports, Bottom Sheet on Mobile for forms */}
      <div
        className={cn(
          'relative w-full bg-white p-5 sm:p-6 shadow-2xl dark:bg-slate-900 z-10 duration-200 max-h-[90dvh] sm:max-h-[85vh] flex flex-col',
          isSmallConfirm
            ? 'rounded-3xl border border-slate-200/80 dark:border-slate-800/90 animate-in zoom-in-95'
            : 'rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200/80 dark:border-slate-800/90 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95',
          maxWidths[maxWidth]
        )}
      >
        {/* Mobile Drag Indicator Bar (for bottom sheets only) */}
        {!isSmallConfirm && (
          <div className="sm:hidden mx-auto -mt-1.5 mb-3.5 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
        )}

        <div className="flex items-start justify-between pb-3.5 sm:pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="pr-4">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors touch-manipulation active:scale-95 -mr-1 -mt-1"
            title="ปิด"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3.5 flex-1 overflow-y-auto touch-scroll pr-1 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:pb-1">
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
