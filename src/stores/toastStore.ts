import { create } from 'zustand';

interface ToastState {
  message: string | null;
  type: 'added' | 'removed' | 'success' | 'undo' | null;
  duration?: number;
  onUndo?: () => void;
  showToast: (message: string, type: 'added' | 'removed' | 'success' | 'undo', duration?: number, onUndo?: () => void) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: null,
  onUndo: undefined,
  duration: 3000,
  showToast: (message, type, duration = 3000, onUndo) => set({ message, type, duration, onUndo }),
  hideToast: () => set({ message: null, type: null, onUndo: undefined }),
}));
