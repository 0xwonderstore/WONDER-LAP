import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DateRange } from 'react-day-picker';

interface InstagramPageState {
  currentPage: number;
  filters: {
    username: string;
    minLikes: number | null;
    maxLikes: number | null;
    languages: string[];
  };
  dateRange: DateRange | undefined;
  sort: 'asc' | 'desc' | null;
  setCurrentPage: (page: number) => void;
  setFilters: (newFilters: Partial<InstagramPageState['filters']>) => void;
  setDateRange: (dateRange: DateRange | undefined) => void;
  setSort: (sort: 'asc' | 'desc' | null) => void;
  reset: () => void;
}

const initialState = {
  currentPage: 1,
  filters: {
    username: "",
    minLikes: null,
    maxLikes: null,
    languages: [],
  },
  dateRange: undefined,
  sort: null,
};

export const useInstagramPageStore = create<InstagramPageState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentPage: (page) => set({ currentPage: page }),
      setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      setDateRange: (dateRange) => set({ dateRange }),
      setSort: (sort) => set({ sort }),
      reset: () => set(initialState),
    }),
    {
      name: 'instagram-page-storage',
      version: 1,
      // By using partialize, we can omit `dateRange` from being persisted to storage.
      // This ensures it will always start with its `initialState` value (`undefined`).
      partialize: (state) => {
        const { dateRange, ...rest } = state;
        return rest;
      },
      migrate: (persistedState: any, version: number) => {
        if (version === 0 && persistedState && persistedState.filters) {
          // If the old 'language' (string) exists, convert it to 'languages' (array)
          if (typeof persistedState.filters.language === 'string') {
            persistedState.filters.languages = persistedState.filters.language ? [persistedState.filters.language] : [];
            delete persistedState.filters.language; // remove the old key
          }
          // Ensure 'languages' is always an array, even if hydration fails unexpectedly.
          if (!Array.isArray(persistedState.filters.languages)) {
            persistedState.filters.languages = [];
          }
        }
        return persistedState as InstagramPageState;
      },
    }
  )
);