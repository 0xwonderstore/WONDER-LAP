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
  sortBy: 'likes' | 'comments'; // New field to determine what to sort by
  setCurrentPage: (page: number) => void;
  setFilters: (newFilters: Partial<InstagramPageState['filters']>) => void;
  setDateRange: (dateRange: DateRange | undefined) => void;
  setSort: (sort: 'asc' | 'desc' | null) => void;
  setSortBy: (sortBy: 'likes' | 'comments') => void; // New action
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
  sortBy: 'likes' as const, // Default to likes
};

export const useInstagramPageStore = create<InstagramPageState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentPage: (page) => set({ currentPage: page }),
      setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      setDateRange: (dateRange) => set({ dateRange }),
      setSort: (sort) => set({ sort }),
      setSortBy: (sortBy) => set({ sortBy }),
      reset: () => set(initialState),
    }),
    {
      name: 'instagram-page-storage',
      version: 2, // Increment version for migration
      partialize: (state) => {
        const { dateRange, ...rest } = state;
        return rest;
      },
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
            // Default sortBy to 'likes' for older versions
            persistedState.sortBy = 'likes';
        }
        
        if (version === 0 && persistedState && persistedState.filters) {
          if (typeof persistedState.filters.language === 'string') {
            persistedState.filters.languages = persistedState.filters.language ? [persistedState.filters.language] : [];
            delete persistedState.filters.language;
          }
          if (!Array.isArray(persistedState.filters.languages)) {
            persistedState.filters.languages = [];
          }
        }
        return persistedState as InstagramPageState;
      },
    }
  )
);