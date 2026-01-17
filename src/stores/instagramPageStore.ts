import { create } from 'zustand';
import { persist, StorageValue } from 'zustand/middleware';
import { DateRange } from 'react-day-picker';

interface InstagramPageState {
  currentPage: number;
  postsPerPage: number;
  filters: {
    username: string;
    minLikes: number | null;
    maxLikes: number | null;
    minComments: number | null;
    maxComments: number | null;
    languages: string[];
  };
  dateRange: DateRange | undefined;
  sort: 'asc' | 'desc';
  sortBy: 'likes' | 'comments' | 'date';
  setCurrentPage: (page: number) => void;
  setPostsPerPage: (count: number) => void;
  setFilters: (newFilters: Partial<InstagramPageState['filters']>) => void;
  setDateRange: (dateRange: DateRange | undefined) => void;
  setSort: (sort: 'asc' | 'desc') => void;
  setSortBy: (sortBy: 'likes' | 'comments' | 'date') => void;
  reset: () => void;
}

const initialState = {
  currentPage: 1,
  postsPerPage: 24,
  filters: {
    username: "",
    minLikes: 0,
    maxLikes: null,
    minComments: 0,
    maxComments: null,
    languages: [],
  },
  dateRange: undefined,
  sort: 'desc' as const,
  sortBy: 'date' as const,
};

export const useInstagramPageStore = create<InstagramPageState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentPage: (page) => set({ currentPage: page }),
      setPostsPerPage: (count) => set({ postsPerPage: count, currentPage: 1 }),
      setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      setDateRange: (dateRange) => set({ dateRange }),
      setSort: (sort) => set({ sort }),
      setSortBy: (sortBy) => set({ sortBy }),
      reset: () => set(initialState),
    }),
    {
      name: 'instagram-page-storage',
      version: 7, // Incremented version to apply changes for everyone
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const data = JSON.parse(str);
            // Convert string dates back to Date objects
            if (data.state.dateRange) {
              if (data.state.dateRange.from) {
                data.state.dateRange.from = new Date(data.state.dateRange.from);
              }
              if (data.state.dateRange.to) {
                data.state.dateRange.to = new Date(data.state.dateRange.to);
              }
            }
            return data;
          } catch (e) {
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      migrate: (persistedState: any, version: number) => {
        if (version < 7) {
          if (persistedState.filters) {
            persistedState.filters.minLikes = 0;
            persistedState.filters.minComments = 0;
          }
        }
        return persistedState as InstagramPageState;
      },
    }
  )
);