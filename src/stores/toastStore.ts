import { create } from 'zustand';

interface ToastState {
  message: string | null;
  type: 'added' | 'removed' | null;
  showToast: (message: string, type: 'added' | 'removed') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: null,
  showToast: (message, type) => set({ message, type }),
  hideToast: () => set({ message: null, type: null }),
}));
