// src/stores/useToastStore.ts
// Global Toast notification state matching prototype_mobile_first.html (#toast-success)

import { create } from 'zustand';

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastState {
  toast: ToastData | null;
  isOpen: boolean;
  showToast: (
    title?: string,
    description?: string,
    options?: { duration?: number; type?: 'success' | 'info' | 'error' }
  ) => void;
  hideToast: () => void;
}

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  isOpen: false,
  showToast: (
    title = 'บันทึกรายการสำเร็จ!',
    description = 'บันทึกข้อมูลเรียบร้อยแล้ว',
    options
  ) => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    const duration = options?.duration ?? 3200;

    set({
      toast: {
        id: Math.random().toString(36).slice(2),
        title,
        description,
        type: options?.type || 'success',
      },
      isOpen: true,
    });

    toastTimeout = setTimeout(() => {
      set({ isOpen: false });
    }, duration);
  },
  hideToast: () => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    set({ isOpen: false });
  },
}));
