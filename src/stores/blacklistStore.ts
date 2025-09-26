import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface BlacklistState {
  keywords: string[];
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
}

export const useBlacklistStore = create<BlacklistState>()(
  persist(
    (set) => ({
      keywords: [],
      addKeyword: (keyword) =>
        set((state) => ({
          keywords: Array.from(new Set([...state.keywords, keyword.toLowerCase().trim()])),
        })),
      removeKeyword: (keyword) =>
        set((state) => ({
          keywords: state.keywords.filter((k) => k !== keyword),
        })),
    }),
    {
      name: 'blacklist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
